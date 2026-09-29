import { createContext, useContext } from "react";

type ConfirmModal = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

export const ConfirmModalCtx = createContext<ConfirmModal>({
  isOpen: false,
  open: () => {},
  close: () => {},
});

export const useConfirmModal = () => useContext(ConfirmModalCtx);
