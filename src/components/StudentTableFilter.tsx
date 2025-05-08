interface Props {
  label: string;
  blocks: string[];
  onSelectFilter: (block: string) => void;
}

const StudentTableFilter = ({ label, blocks, onSelectFilter }: Props) => {
  return (
    <select className="bg-transparent p-2" onChange={(event) => onSelectFilter(event.target.value)}>
      <option className="text-black" value="">
        {label}
      </option>
      {blocks.map((block) => (
        <option className="text-black" key={block} value={block}>
          {block}
        </option>
      ))}
    </select>
  );
};

export default StudentTableFilter;
