import { createContext, useContext, useState, type ReactNode } from "react";
import { WSService } from "../api/ws";

const WSContext = createContext<{
  service: WSService | null;
  setService: React.Dispatch<React.SetStateAction<WSService | null>>;
} | null>(null);

export const WSProvider = ({ children }: { children: ReactNode }) => {
  const [service, setService] = useState<WSService | null>(null);

  return (
    <WSContext.Provider value={{ service, setService }}>
      {children}
    </WSContext.Provider>
  );
};

export const useWSContext = () => {
  const context = useContext(WSContext);

  if (!context) {
    throw new Error("useWSContext must be used within a WSProvider");
  }
  return context;
};
