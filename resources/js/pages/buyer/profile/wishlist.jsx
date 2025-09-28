import BuyerLayoutNonSearch from "@/layouts/buyer-layout-non-search"
import { Heart } from "lucide-react"

const GantiPassword = () => {
    return (
        <BuyerLayoutNonSearch backLink={route('buyer.profile.index')} title="Wishlist">
            <div className="flex justify-center flex-col items-center my-20">
                <Heart className="h-20 text-red-600 w-20 my-8" />
                <span className="text-xl">
                    Fitur ini akan segera tersedia
                </span>
            </div>
        </BuyerLayoutNonSearch>
    )
}

export default GantiPassword