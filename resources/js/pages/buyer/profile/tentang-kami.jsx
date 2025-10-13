import BuyerLayoutNonSearch from "@/layouts/buyer-layout-non-search"
import { Button } from '@/components/ui/button'

const TentangKami = () => {
    return (
        <BuyerLayoutNonSearch backLink={route('buyer.profile.index')} title="Tentang Kami">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
                {/* Hero Section */}
                <div className="text-center mb-8 sm:mb-12">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Tentang Bahana</h1>
                    <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto px-2">
                        Platform digital yang memberdayakan UMKM Indonesia melalui sistem affiliate yang inovatif
                    </p>
                </div>

                {/* Mission Section */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8 shadow-sm">
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">Misi Kami</h2>
                    <p className="text-gray-700 text-base sm:text-lg leading-relaxed">
                        Bahana hadir untuk menjembatani UMKM dengan pasar yang lebih luas melalui jaringan mitra hotel. 
                        Kami percaya bahwa setiap produk lokal berkualitas layak mendapatkan akses pasar yang setara.
                    </p>
                </div>

                {/* How We Help UMKM */}
                <div className="mb-8 sm:mb-12">
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6 text-center">Bagaimana Kami Membantu UMKM</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div className="bg-white border border-gray-100 rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Akses Pasar yang Lebih Luas</h3>
                            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                                UMKM dapat menjangkau tamu hotel melalui jaringan mitra kami tanpa perlu investasi besar dalam distribusi.
                            </p>
                        </div>

                        <div className="bg-white border border-gray-100 rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Sistem yang Aman</h3>
                            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                                Pembayaran yang terjamin dan sistem inventory yang terintegrasi memastikan bisnis berjalan lancar.
                            </p>
                        </div>

                        <div className="bg-white border border-gray-100 rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Analitik Real-time</h3>
                            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                                Laporan penjualan dan performa produk yang detail membantu UMKM membuat keputusan bisnis yang tepat.
                            </p>
                        </div>

                        <div className="bg-white border border-gray-100 rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Komunitas yang Mendukung</h3>
                            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                                Bergabung dengan komunitas UMKM dan mitra yang saling mendukung dalam mengembangkan bisnis.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Our Impact */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8 shadow-sm">
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6 text-center">Dampak Positif untuk UMKM</h2>
                    <div className="grid grid-cols-3 gap-4 sm:gap-6 text-center">
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                            <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">500+</div>
                            <div className="text-xs sm:text-sm text-gray-600 font-medium">UMKM Terdaftar</div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                            <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-2">150+</div>
                            <div className="text-xs sm:text-sm text-gray-600 font-medium">Mitra Hotel</div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                            <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-2">10K+</div>
                            <div className="text-xs sm:text-sm text-gray-600 font-medium">Produk Terjual</div>
                        </div>
                    </div>
                </div>

                {/* Values */}
                <div className="mb-6 sm:mb-8">
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6 text-center">Nilai-nilai Kami</h2>
                    <div className="space-y-4">
                        <div className="flex items-start bg-white rounded-xl p-4 shadow-sm">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">Keberlanjutan</h3>
                                <p className="text-sm sm:text-base text-gray-600">Mendorong pertumbuhan UMKM yang berkelanjutan dan berdampak positif bagi ekonomi lokal.</p>
                            </div>
                        </div>
                        <div className="flex items-start bg-white rounded-xl p-4 shadow-sm">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">Kolaborasi</h3>
                                <p className="text-sm sm:text-base text-gray-600">Membangun ekosistem yang saling menguntungkan antara UMKM, mitra hotel, dan konsumen.</p>
                            </div>
                        </div>
                        <div className="flex items-start bg-white rounded-xl p-4 shadow-sm">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">Inovasi</h3>
                                <p className="text-sm sm:text-base text-gray-600">Terus mengembangkan teknologi untuk memudahkan UMKM dalam berbisnis digital.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 sm:p-8 text-center text-white shadow-lg">
                    <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Bergabunglah dengan Bahana</h2>
                    <p className="text-blue-100 text-sm sm:text-base mb-4 sm:mb-6 max-w-2xl mx-auto">
                        Jadilah bagian dari revolusi digital UMKM Indonesia. Daftarkan bisnis Anda sekarang dan perluas jangkauan pasar bersama kami.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                        <Button className="bg-white text-blue-600 px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-sm">
                            Daftar sebagai UMKM
                        </Button>
                        <Button variant="outline" className="border border-white text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                            Pelajari Lebih Lanjut
                        </Button>
                    </div>
                </div>
            </div>
        </BuyerLayoutNonSearch>
    )
}
export default TentangKami
