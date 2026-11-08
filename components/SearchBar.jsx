import styles from "./SearchBar.module.scss";
const searchIcon = "/asset/ic_search.png";

const SearchBar = ({
  searchInput,
  setSearchInput,
  setKeyword,
  setPageNumber,
  placeholder = "검색할 상품을 입력해주세요"
}) => {

  const handleSearchKeyDown = (event) => {
    if (event.key === "Enter" && !event.nativeEvent.isComposing) {
      event.preventDefault();
      setKeyword(searchInput);
      setPageNumber(1);
    }
  };

  const handleSearch = () => {
    setKeyword(searchInput);
    setPageNumber(1);
  };

  return(
    <div className={styles.searchBox}>
      <button
        type="button"
        className={styles.searchButton}
        onClick={handleSearch}
        aria-label="검색"
      >
      <img src={searchIcon} alt="검색" />
      </button>
      <input
        type="text"
        placeholder={placeholder}
        aria-label={placeholder}
        value={searchInput}
        onChange={(event) => {
          setSearchInput(event.target.value)}}
        onKeyDown={handleSearchKeyDown}
      />
    </div>
  );
};

export default SearchBar;
