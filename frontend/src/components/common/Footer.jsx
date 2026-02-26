const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white p-8 mt-auto">
            <div className="container mx-auto text-center">
                <p>&copy; {new Date().getFullYear()} Bhumi Putra. All rights reserved.</p>
                <div className="mt-4 pt-4 border-t border-gray-700">
                    <p className="text-sm text-gray-400">Developed by <span className="text-white font-medium">Ganesh Ghule</span></p>
                    <p className="text-sm text-gray-400">Email: <a href="mailto:ganeshghule757@gmail.com" className="text-green-400 hover:text-green-300">ganeshghule757@gmail.com</a></p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
