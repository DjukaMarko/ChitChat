import { MousePointerClick, Search } from "lucide-react"

export const SearchInput = ({ searchInput, setSearchInput, handleSearchSubmit }) => {

    return (
        <div className="group">
            <div className="py-2 flex space-x-2 items-center px-5 rounded-xl bg-secondaryC group-hover:bg-secondaryCHover font-light outline-0">
                <Search color="#9e9e9e" width={20} height={20} />
                <input
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="text-sm text-textColor outline-0 border-0 w-full bg-secondaryC font-[400] placeholder-[#9e9e9e] group-hover:bg-secondaryCHover"
                    type="text"
                    placeholder="Search For Friends"
                />
                <button onClick={handleSearchSubmit} className="disabled:cursor-not-allowed disabled:opacity-50" disabled={searchInput === "" ? true : false}><MousePointerClick color="#9e9e9e" width={20} height={20} /></button>
            </div>
        </div>
    )
}