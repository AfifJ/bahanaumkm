import BuyerLayoutNonSearch from "@/layouts/buyer-layout-non-search"
import { useState } from "react"

const Bantuan = () => {
    const [openItems, setOpenItems] = useState({})

    const toggleItem = (id) => {
        setOpenItems(prev => ({
            ...prev,
            [id]: !prev[id]
        }))
    }

    const faqCategories = [
        {
            id: 'umkm',
            title: 'Untuk UMKM & Vendor',
            items: [
                {
                    id: 'umkm-1',
                    question: 'Bagaimana cara mendaftar sebagai vendor UMKM di Bahana?',
                    answer: 'Anda dapat mendaftar sebagai vendor UMKM dengan mengisi formulir pendaftaran di halaman registrasi. Pilih role "Vendor" dan lengkapi data bisnis Anda. Setelah verifikasi, Anda dapat mulai menambahkan produk ke katalog.'
                },
                {
                    id: 'umkm-2',
                    question: 'Apa keuntungan menjadi vendor di platform Bahana?',
                    answer: 'Sebagai vendor, Anda mendapatkan akses ke jaringan mitra hotel yang luas, sistem manajemen inventori terintegrasi, pembayaran yang aman, dan laporan penjualan real-time. Platform kami membantu memperluas jangkauan pasar produk UMKM Anda.'
                },
                {
                    id: 'umkm-3',
                    question: 'Bagaimana sistem komisi untuk vendor?',
                    answer: 'Vendor menerima pembayaran langsung untuk setiap produk yang terjual. Harga jual sudah termasuk margin keuntungan yang ditentukan oleh vendor. Sistem kami transparan dan pembayaran dilakukan secara berkala.'
                },
                {
                    id: 'umkm-4',
                    question: 'Bagaimana cara mengelola stok produk?',
                    answer: 'Anda dapat mengelola stok melalui dashboard vendor. Sistem akan otomatis mengurangi stok ketika ada pesanan, dan Anda akan mendapatkan notifikasi ketika stok hampir habis.'
                }
            ]
        },
        {
            id: 'mitra',
            title: 'Untuk Mitra Hotel',
            items: [
                {
                    id: 'mitra-1',
                    question: 'Bagaimana cara menjadi mitra hotel di Bahana?',
                    answer: 'Hotel dapat mendaftar sebagai mitra dengan memilih role "Mitra" saat registrasi. Lengkapi profil hotel dan verifikasi data. Setelah aktif, Anda dapat menampilkan katalog produk UMKM kepada tamu hotel.'
                },
                {
                    id: 'mitra-2',
                    question: 'Apa keuntungan menjadi mitra hotel?',
                    answer: 'Mitra hotel mendapatkan komisi dari setiap penjualan produk UMKM melalui platform. Selain itu, Anda dapat meningkatkan layanan kepada tamu dengan menyediakan produk lokal berkualitas.'
                },
                {
                    id: 'mitra-3',
                    question: 'Bagaimana sistem komisi untuk mitra?',
                    answer: 'Komisi mitra dihitung berdasarkan persentase dari total penjualan. Besaran komisi dapat bervariasi tergantung jenis produk dan kesepakatan. Pembayaran komisi dilakukan secara berkala.'
                }
            ]
        },
        {
            id: 'pembeli',
            title: 'Untuk Pembeli',
            items: [
                {
                    id: 'pembeli-1',
                    question: 'Bagaimana cara membeli produk di Bahana?',
                    answer: 'Pembeli dapat menjelajahi katalog produk, memilih produk yang diinginkan, dan melakukan pemesanan melalui mitra hotel terdekat. Pembayaran dapat dilakukan secara online atau langsung di hotel.'
                },
                {
                    id: 'pembeli-2',
                    question: 'Apakah produk yang dijual terjamin kualitasnya?',
                    answer: 'Ya, semua produk di platform Bahana berasal dari UMKM terverifikasi yang telah melalui proses kurasi kualitas. Kami memastikan hanya produk berkualitas yang tersedia di platform.'
                },
                {
                    id: 'pembeli-3',
                    question: 'Bagaimana sistem pengiriman produk?',
                    answer: 'Produk dapat diambil langsung di mitra hotel atau dikirim ke alamat pembeli tergantung kebijakan masing-masing mitra. Informasi pengiriman lengkap tersedia di halaman produk.'
                }
            ]
        },
        {
            id: 'teknis',
            title: 'Bantuan Teknis',
            items: [
                {
                    id: 'teknis-1',
                    question: 'Bagaimana jika lupa password?',
                    answer: 'Anda dapat menggunakan fitur "Lupa Password" di halaman login. Sistem akan mengirimkan link reset password ke email terdaftar.'
                },
                {
                    id: 'teknis-2',
                    question: 'Bagaimana cara menghubungi customer service?',
                    answer: 'Tim support kami tersedia melalui email: support@bahana.id atau telepon: (021) 1234-5678. Jam operasional: Senin-Jumat, 09:00-17:00 WIB.'
                },
                {
                    id: 'teknis-3',
                    question: 'Apakah platform Bahana aman digunakan?',
                    answer: 'Ya, platform Bahana menggunakan teknologi keamanan terkini untuk melindungi data pengguna. Semua transaksi dilindungi dengan enkripsi SSL dan sistem keamanan berlapis.'
                }
            ]
        }
    ]

    return (
        <BuyerLayoutNonSearch backLink={route('buyer.profile.index')} title="Pusat Bantuan">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
                {/* Header */}
                <div className="text-center mb-6 sm:mb-8">
                    <div className="w-16 h-16 mx-auto mb-3 sm:mb-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Pusat Bantuan Bahana</h1>
                    <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-2">
                        Temukan jawaban untuk pertanyaan umum tentang platform kami yang membantu UMKM berkembang
                    </p>
                </div>

                {/* FAQ Sections */}
                {faqCategories.map(category => (
                    <div key={category.id} className="mb-6 sm:mb-8">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-6 mb-3 sm:mb-4">
                            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                                {category.title}
                            </h2>
                        </div>
                        <div className="space-y-3 sm:space-y-4">
                            {category.items.map(item => (
                                <div key={item.id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
                                    <button
                                        onClick={() => toggleItem(item.id)}
                                        className="w-full px-4 sm:px-6 py-3 sm:py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors rounded-xl"
                                    >
                                        <span className="text-sm sm:text-base font-medium text-gray-900 pr-2 text-left">
                                            {item.question}
                                        </span>
                                        <svg
                                            className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0 transform transition-transform duration-300 ${
                                                openItems[item.id] ? 'rotate-180' : ''
                                            }`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    {openItems[item.id] && (
                                        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
                                            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{item.answer}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Contact Section */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 sm:p-8 text-white shadow-lg mt-6 sm:mt-8">
                    <div className="text-center mb-4 sm:mb-6">
                        <h3 className="text-lg sm:text-xl font-semibold mb-2">Butuh Bantuan Lebih Lanjut?</h3>
                        <p className="text-blue-100 text-sm sm:text-base">
                            Tim support kami siap membantu Anda. Hubungi kami melalui:
                        </p>
                    </div>
                    <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-center justify-center bg-white/10 rounded-lg p-3 sm:p-4">
                            <svg className="w-5 h-5 text-white mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span className="text-white font-medium">support@bahana.id</span>
                        </div>
                        <div className="flex items-center justify-center bg-white/10 rounded-lg p-3 sm:p-4">
                            <svg className="w-5 h-5 text-white mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span className="text-white font-medium">(021) 1234-5678</span>
                        </div>
                    </div>
                    <div className="text-center mt-4 sm:mt-6">
                        <p className="text-blue-100 text-xs sm:text-sm">
                            Jam operasional: Senin-Jumat, 09:00-17:00 WIB
                        </p>
                    </div>
                </div>
            </div>
        </BuyerLayoutNonSearch>
    )
}
export default Bantuan
