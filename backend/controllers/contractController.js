const PDFDocument = require('pdfkit');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const dotenv = require('dotenv');

// Load env vars explicitly to ensure they are available
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const isServiceKey = supabaseKey === process.env.SUPABASE_SERVICE_ROLE_KEY;

// Debug log on init
console.log("[CONTRACT CONTROLLER] Init");
console.log("- Service Role Key Present?", !!process.env.SUPABASE_SERVICE_ROLE_KEY);
console.log("- Using Service Key?", isServiceKey);

const supabase = createClient(supabaseUrl, supabaseKey);

const generateContract = async (req, res) => {
    try {
        const { listingId, buyerId, farmerId, paymentMode } = req.body;

        // 1. Fetch Listing Details
        const { data: listing, error: listingError } = await supabase
            .from('crop_listings') // Corrected table name
            .select('*')
            .eq('id', listingId)
            .single();

        if (listingError || !listing) {
            console.error("Listing fetch error:", listingError);
            return res.status(404).json({ message: "Listing not found" });
        }

        // 2. Fetch Farmer (Seller) Details
        const { data: farmer, error: farmerError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', farmerId)
            .single();

        // 3. Fetch Buyer Details
        const { data: buyer, error: buyerError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', buyerId)
            .single();

        if (farmerError || buyerError) {
            console.error("Profile fetch error:", farmerError, buyerError);
            return res.status(404).json({ message: "User profiles not found" });
        }

        // 4. Record Contract in Database
        const { data: contractData, error: contractError } = await supabase
            .from('contracts')
            .insert([{
                listing_id: listingId,
                farmer_id: farmerId,
                buyer_id: buyerId,
                payment_mode: paymentMode,
                status: 'generated'
            }])
            .select()
            .single();

        if (contractError) {
            console.error("Error creating contract record:", contractError);
            return res.status(500).json({ message: "Failed to create contract record" });
        }

        // 5. Send Notification to Buyer
        // Fetch farmer name for notification
        const farmerName = farmer?.name || 'Farmer';

        const { data: notificationData, error: notificationError } = await supabase
            .from('notifications')
            .insert([{
                sender_id: farmerId,
                receiver_id: buyerId,
                listing_id: listingId,
                contract_id: contractData.id,
                crop_name: listing.crop_name,
                buyer_name: farmerName, // This is misleading - should be farmer_name
                message: `${farmerName} has generated a contract for ${listing.crop_name}`,
                type: 'contract_generated',
                status: 'unread'
            }])
            .select()
            .single();

        if (notificationError) {
            console.error("Error creating notification:", notificationError);
            // Continue anyway - contract was created successfully
        }

        // Emit Socket.IO event to buyer for real-time notification
        // Access io from app (need to pass it via middleware or global)
        if (global.io && notificationData) {
            global.io.to(buyerId).emit('notification_received', notificationData);
        }

        // 6. Generate PDF
        const doc = new PDFDocument();
        const filename = `Contract_${listing.crop_name}_${Date.now()}.pdf`;

        res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-type', 'application/pdf');

        doc.pipe(res);

        // -- PDF CONTENT --

        // Header
        doc.fontSize(25).text('Farming Agreement / Contract', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Date: ${new Date().toLocaleDateString()}`, { align: 'right' });
        doc.text(`Contract ID: ${contractData?.id || 'Pending'}`, { align: 'right' });
        doc.moveDown(2);

        // Parties
        doc.fontSize(16).text('Between:', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(12).text(`Seller (Farmer): ${farmer.name || 'N/A'}`);
        doc.text(`Contact: ${farmer.phone || 'N/A'}`);
        doc.text(`Address: ${farmer.village || ''}, ${farmer.district || ''}, ${farmer.state || ''}`);

        doc.moveDown();
        doc.text('AND', { align: 'center', bold: true });
        doc.moveDown();

        doc.text(`Buyer: ${buyer.name || 'N/A'}`);
        doc.text(`Contact: ${buyer.phone || 'N/A'}`);
        doc.text(`Address: ${buyer.village || ''}, ${buyer.district || ''}, ${buyer.state || ''}`);
        doc.moveDown(2);

        // Agreement Details
        doc.fontSize(16).text('Agreed Transaction Details:', { underline: true });
        doc.moveDown(0.5);

        doc.fontSize(14).text(`Crop: ${listing.crop_name}`);
        if (listing.price) doc.text(`Price: ₹${listing.price} per ${listing.unit || 'quintal'}`);
        if (listing.quantity) doc.text(`Quantity Available: ${listing.quantity} ${listing.unit || 'quintal'}`);

        doc.moveDown();
        doc.text(`Payment Mode Selected: ${paymentMode || 'Not Specified'}`);

        doc.moveDown(2);

        // Terms
        doc.fontSize(14).text('Terms & Conditions:', { underline: true });
        doc.fontSize(10)
            .text('1. The Seller agrees to sell the above-mentioned crop to the Buyer at the agreed price.')
            .text('2. The Buyer agrees to pay the amount via the selected payment mode upon delivery/pickup.')
            .text('3. Both parties agree that the crop quality meets the discussed standards.')
            .text('4. This contract is generated electronically via the App and serves as a record of mutual interest and agreement.');

        doc.moveDown(4);

        // Signatures
        doc.text('__________________________                __________________________');
        doc.text('Seller Signature                                   Buyer Signature', { indent: 20 });

        doc.end();

    } catch (error) {
        console.error("Generate Contract Error:", error);
        if (!res.headersSent) {
            res.status(500).json({ message: error.message });
        }
    }
};

// Get contract details by ID
const getContractDetails = async (req, res) => {
    try {
        const { contractId } = req.params;
        console.log(`[DEBUG] Fetching contract details for ID: ${contractId}`);
        console.log(`[DEBUG] Using Service Key: ${isServiceKey}`);

        const { data: contract, error } = await supabase
            .from('contracts')
            .select(`
                *,
                listing:crop_listings (
                    crop_name,
                    price:price_per_unit,
                    quantity,
                    unit,
                    description,
                    image_url
                ),
                farmer:profiles!contracts_farmer_id_fkey (
                    name,
                    phone,
                    email,
                    village,
                    district,
                    state,
                    rating,
                    rating_count,
                    avatar_url
                ),
                buyer:profiles!contracts_buyer_id_fkey (
                    name,
                    phone,
                    email
                )
            `)
            .eq('id', contractId)
            .single();

        if (error) {
            console.error("[DEBUG] Supabase error fetching contract:", error);
        }

        if (!contract) {
            console.error("[DEBUG] Contract not found in database for ID:", contractId);
            return res.status(404).json({
                message: "Contract not found",
                details: error || "No data returned",
                queryId: contractId,
                debug: {
                    isServiceKey: isServiceKey,
                    keyLength: supabaseKey ? supabaseKey.length : 0
                }
            });
        }

        console.log("[DEBUG] Contract found:", contract.id);
        res.status(200).json({ contract });

    } catch (error) {
        console.error("Get Contract Details Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// Update contract delivery status
const updateDeliveryStatus = async (req, res) => {
    try {
        const { contractId } = req.params;
        const { deliveryStatus } = req.body;

        // Validate status
        const validStatuses = ['pending', 'delivered', 'rated', 'not_arrived'];
        if (!validStatuses.includes(deliveryStatus)) {
            return res.status(400).json({ message: "Invalid delivery status" });
        }

        const { data, error } = await supabase
            .from('contracts')
            .update({ delivery_status: deliveryStatus })
            .eq('id', contractId)
            .select()
            .single();

        if (error) {
            console.error("Update Delivery Status Error:", error);
            return res.status(500).json({ message: "Failed to update delivery status" });
        }

        res.status(200).json({
            message: "Delivery status updated successfully",
            contract: data
        });

    } catch (error) {
        console.error("Update Delivery Status Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// Accept a deal (Create contract from notification/interest)
const acceptDeal = async (req, res) => {
    try {
        const { listingId, farmerId, buyerId } = req.body;

        console.log("Accepting deal:", { listingId, farmerId, buyerId });

        // 1. Fetch Listing Details to get price/quantity
        const { data: listing, error: listingError } = await supabase
            .from('crop_listings')
            .select('*')
            .eq('id', listingId)
            .single();

        if (listingError || !listing) {
            console.error("Listing fetch error:", listingError);
            return res.status(404).json({ message: "Listing not found" });
        }

        // 2. Create Contract Record
        const { data: contract, error: contractError } = await supabase
            .from('contracts')
            .insert([{
                listing_id: listingId,
                farmer_id: farmerId,
                buyer_id: buyerId,
                payment_mode: 'Pending', // Will be updated later or can be negotiated
                status: 'accepted',
                delivery_status: 'pending'
            }])
            .select()
            .single();

        if (contractError) {
            console.error("Error creating contract:", contractError);
            return res.status(500).json({ message: "Failed to create contract" });
        }

        // 3. Fetch Farmer Name for Notification
        const { data: farmer } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', farmerId)
            .single();

        const farmerName = farmer?.name || 'Farmer';

        // 4. Create Notification for Buyer
        const { data: notification, error: notifError } = await supabase
            .from('notifications')
            .insert([{
                sender_id: farmerId,
                receiver_id: buyerId,
                listing_id: listingId,
                contract_id: contract.id, // LINKED HERE
                crop_name: listing.crop_name,
                buyer_name: farmerName, // Used as sender name in UI
                message: `${farmerName} has accepted your interest in ${listing.crop_name}`,
                type: 'deal_accepted',
                status: 'unread'
            }])
            .select()
            .single();

        if (notifError) {
            console.error("Error creating notification:", notifError);
        }

        // 5. Real-time Notification
        if (global.io && notification) {
            global.io.to(buyerId).emit('notification_received', notification);
        }

        res.status(201).json({
            message: "Deal accepted and contract created",
            contract,
            notification
        });

    } catch (error) {
        console.error("Accept Deal Error:", error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { generateContract, getContractDetails, updateDeliveryStatus, acceptDeal };
