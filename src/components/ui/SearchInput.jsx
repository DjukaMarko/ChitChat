import { MousePointerClick, Search } from "lucide-react"

export const SearchInput = ({ isSearchMenuOpened, setSearchMenuOpened, searchInput, setSearchInput, handleSearchSubmit, possibleRequests }) => {
    const handleChange = async (e) => {
        setSearchMenuOpened(true);
        setSearchInput(e.target.value);
        handleSearchSubmit(e.target.value);
    }
    return (
        <div className="group">
            <div className={`py-2 flex space-x-2 items-center px-5 ${isSearchMenuOpened ? "rounded-t-xl" : "rounded-xl"} bg-secondaryC group-hover:bg-secondaryCHover font-light outline-0`}>
                <Search color="#9e9e9e" width={20} height={20} />
                <form className="w-full flex" onClick={(e) => e.preventDefault()}>
                    <input
                        value={searchInput}
                        onChange={(e) => handleChange(e)}
                        className="text-sm text-textColor outline-0 border-0 w-full bg-secondaryC font-[400] placeholder-inputInnerElements group-hover:bg-secondaryCHover"
                        type="text"
                        placeholder="Search For Friends"
                    />
                    <button className="disabled:cursor-not-allowed disabled:opacity-50" disabled={searchInput === "" ? true : false}><MousePointerClick color="#9e9e9e" width={20} height={20} /></button>
                </form>
            </div>
        </div>
    )
}