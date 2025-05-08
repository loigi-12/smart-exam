interface Props {
  label: string;
  data: string[];
  onSelectFilter: (block: string) => void;
}

const TableFilter = ({ label, data, onSelectFilter }: Props) => {
  return (
    <select
      className="bg-[#111c38] text-white p-2"
      onChange={(event) => onSelectFilter(event.target.value)}
    >
      <option className="text-black" value="">
        {label}
      </option>
      {data.map((d) => (
        <option className="text-black" key={d} value={d}>
          {d}
        </option>
      ))}
    </select>
  );
};

export default TableFilter;
