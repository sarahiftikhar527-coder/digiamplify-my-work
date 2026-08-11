import React from 'react';
import Image from 'next/image';
import Title from '@/components/ui/Title';

const galleryImages = [
    { src: "/assets/home/home-gallery-pc.jpg", alt: "PC Hardware", span: "md:col-span-5" },
    { src: "/assets/home/home-gallery-abstract.jpg", alt: "Red Abstract Light", span: "md:col-span-4" },
    { src: "/assets/home/home-gallery-code.jpg", alt: "Code Editor", span: "md:col-span-3" },
    { src: "/assets/home/home-gallery-maze.jpg", alt: "Red Maze Pattern", span: "md:col-span-3" },
    { src: "/assets/home/home-gallery-keyboard.jpg", alt: "Custom Keyboard", span: "md:col-span-4" },
    { src: "/assets/home/home-gallery-dark.jpg", alt: "Dark Aesthetic", span: "md:col-span-5" },
];

export default function HomeGallery() {
    return (
        <section className="w-full py-8 bg-[#050505] overflow-hidden">
            <div className="max-w-[1350px] mx-auto px-6 lg:px-12">

                <div className="mb-14">
                    <Title as="h2" className="text-3xl sm:text-4xl lg:text-[38px] font-medium leading-[1.3] tracking-tight text-white">
                        <span className="block">Enterprise discipline. Boutique taste</span>
                        <span className="block">Category level <span className="text-[#be0919]">output.</span></span>
                    </Title>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-5">
                    {galleryImages.map((img, index) => (
                        <div
                            key={index}
                            className={`relative w-full h-[250px] lg:h-[200px] rounded-2xl overflow-hidden border border-white/20 group hover:border-[#be0919]/50 transition-colors duration-300 ${img.span}`}
                        >
                            <Image
                                src={img.src}
                                alt={img.alt}
                                fill
                                className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                            />
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}
