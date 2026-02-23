import React from 'react';
import book1 from '../assets/images/book1.webp';
import book2 from '../assets/images/book2.jpg';
import book3 from '../assets/images/book3.jpg';
import book4 from '../assets/images/book4.jpg';
import book5 from '../assets/images/book5.jpg';
import book6 from '../assets/images/book6.jpg';
import book7 from '../assets/images/book7.jpg';
import book8 from '../assets/images/book8.jpg';
import book9 from '../assets/images/book9.jpg';
import book10 from '../assets/images/book10.jpg';
import book11 from '../assets/images/book11.jpg';
import book12 from '../assets/images/book12.jpg';

const books = [
    { id: 1, src: book1, alt: 'Book 1' },
    { id: 2, src: book2, alt: 'Book 2' },
    { id: 3, src: book3, alt: 'Book 3' },
    { id: 4, src: book4, alt: 'Book 4' },
    { id: 5, src: book5, alt: 'Book 5' },
    { id: 6, src: book6, alt: 'Book 6' },
    { id: 7, src: book7, alt: 'Book 7' },
    { id: 8, src: book8, alt: 'Book 8' },
    { id: 9, src: book9, alt: 'Book 9' },
    { id: 10, src: book10, alt: 'Book 10' },
    { id: 11, src: book11, alt: 'Book 11' },
    { id: 12, src: book12, alt: 'Book 12' },
];

const Resources = () => {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-center text-green-700 mb-8">Agricultural Resources</h1>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {books.map((book) => (
                    <div
                        key={book.id}
                        className="group relative flex flex-col items-center rounded-lg overflow-hidden transition-all duration-300 shadow-md hover:shadow-xl hover:scale-105"
                    >
                        <div className="w-full aspect-[2/3] relative">
                            <img
                                src={book.src}
                                alt={book.alt}
                                className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Resources;
