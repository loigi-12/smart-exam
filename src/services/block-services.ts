import { ref, set, push, get, onValue } from "firebase/database";
import { database } from "@/lib/firebase";

export const createBlock = (
    blockName: string
) => {
    const createdAt = new Date().toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    }); 

    const blockRef = push(ref(database, "blocks"));
    return set(blockRef, {
        name: blockName,
        createdAt: createdAt,
    });
}

export const checkIfBlockExists = async (blockName: string) => {
    const blockRef = ref(database, "blocks");
    const snapshot = await get(blockRef);

    if (snapshot.exists()) {
        const  blocks = snapshot.val();

        return Object.values(blocks).some(
            (blocks: any) => blocks.name === blockName
        )
    }

    return false;
}

export const getBlocks = (callback: (blocks: any[]) => void) => {
  const blockRef = ref(database, "blocks");
  const unsubscribe = onValue(blockRef, (snapshot) => {
    if (snapshot.exists()) {
      const blockData = snapshot.val();
      const blockArray = Object.entries(blockData).map(
        ([id, block]) => ({
          id,
          ...(block as Record<string, any>),
        })
      );
      callback(blockArray);
    } else {
      callback([]);
    }
  });

  return () => unsubscribe();
};
