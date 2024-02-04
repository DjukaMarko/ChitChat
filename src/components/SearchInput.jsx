import search from "../../public/search.png"
import arrow from "../../public/arrow.png"

export const SearchInput = ({ searchInput, setSearchInput, handleSearchSubmit }) => {

    return (
        <div className="group">
            <div className="py-2 flex space-x-2 items-center px-5 rounded-xl bg-[#f7f7f7] group-hover:bg-[#f0f0f0] font-light outline-0">
                <img src={search} className="w-[16px] h-[16px]" />
                <input
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="text-sm md:text-base outline-0 border-0 w-full bg-[#f7f7f7] font-[400] placeholder-[#9e9e9e] group-hover:bg-[#f0f0f0]"
                    type="text"
                    placeholder="Search For Friends"
                />
                <button onClick={handleSearchSubmit} className="w-[16px] h-[16px] disabled:cursor-not-allowed disabled:opacity-50" disabled={searchInput === "" ? true : false}><img src={arrow} className="w-full h-full" /></button>
            </div>
        </div>
    )
}