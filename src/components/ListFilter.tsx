interface Props {
  lists: string[];
  onSelectItem: (item: string) => void;
}

const ListFilter = ({ lists, onSelectItem }: Props) => {
  return (
    <select
      className="block w-full px-3 py-2 border  bg-[#ffffff]  dark:bg-[#182b5c] text-white rounded-md focus:outline-none "
      onChange={(event) => onSelectItem(event.target.value)}
    >
      {lists.map((listItem) => (
        <option key={listItem} value={listItem}>
          {listItem}
        </option>
      ))}
    </select>
  );
};

export default ListFilter;
