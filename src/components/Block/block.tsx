import { useState } from "react";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import CreateBlock from "./Dialog/create-block";
import BlockTable from "./Table/block-table";

export default function BlockPage() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const handleCreateBlock = async (
    _BlockName: string
  ) => {};

  return (
    <div className="p-2">
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-b">
          <div className="w-full sm:w-auto mb-5">
            <Input
              placeholder="Search Block"
              className="w-full sm:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="mb-5">
            <CreateBlock onCreate={handleCreateBlock} />
          </div>
        </div>

        <div className="mt-6">
          <BlockTable searchQuery={searchQuery} />
        </div>
      </Card>
    </div>
  );
}
