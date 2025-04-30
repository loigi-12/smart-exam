import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getBlocks } from "@/services/block-services";
import { useEffect, useState } from "react";

interface BlocksTableProps {
  searchQuery: string;
}

export default function BlocksTable({ searchQuery }: BlocksTableProps) {
  const [blocks, setBlocks] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = getBlocks(setBlocks);
    return () => unsubscribe();
  }, []);

  const filteredBlock = blocks.filter((block) =>
    block.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <Table className="text-center cursor-pointer border-collapse border">
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">No.</TableHead>
            <TableHead className="text-center">Block Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredBlock.length === 0 ? (
            <div className="p-4">
              <p className="text-zinc-500">No block found.</p>
            </div>
          ) : (
            filteredBlock.map((block, index) => (
              <TableRow key={block.id || index}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{block.name}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
