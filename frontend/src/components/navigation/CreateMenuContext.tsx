"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import CreateMenu from "./CreateMenu";
import CreateEventSheet from "@/components/events/CreateEventSheet";
import CreatePlaceSheet from "@/components/places/CreatePlaceSheet";
import CreatePostSheet from "@/components/feed/CreatePostSheet";

interface CreateMenuContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const CreateMenuContext = createContext<CreateMenuContextValue | null>(null);

export function useCreateMenu() {
  const ctx = useContext(CreateMenuContext);
  if (!ctx) throw new Error("useCreateMenu must be used within CreateMenuProvider");
  return ctx;
}

interface CreateMenuProviderProps {
  children: ReactNode;
}

export function CreateMenuProvider({ children }: CreateMenuProviderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <CreateMenuContext.Provider value={{ isOpen, open, close }}>
      {children}
      
      {/* Create Menu Dropdown */}
      <CreateMenu open={isOpen} onClose={close} />
      
      {/* Create Event Sheet */}
      <CreateEventSheetWrapper />
      
      {/* Create Place Sheet */}
      <CreatePlaceSheetWrapper />
      
      {/* Create Post Sheet */}
      <CreatePostSheetWrapper />
    </CreateMenuContext.Provider>
  );
}

// Wrapper components that listen for events and manage their own state
function CreateEventSheetWrapper() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener("open-create-event", handleOpen);
    return () => window.removeEventListener("open-create-event", handleOpen);
  }, []);

  return (
    <CreateEventSheet
      open={open}
      onClose={() => setOpen(false)}
      onCreated={() => setOpen(false)}
    />
  );
}

function CreatePlaceSheetWrapper() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener("open-add-place", handleOpen);
    return () => window.removeEventListener("open-add-place", handleOpen);
  }, []);

  return (
    <CreatePlaceSheet
      open={open}
      onClose={() => setOpen(false)}
      onCreated={() => setOpen(false)}
    />
  );
}

function CreatePostSheetWrapper() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener("open-create-post", handleOpen);
    return () => window.removeEventListener("open-create-post", handleOpen);
  }, []);

  return (
    <CreatePostSheet
      open={open}
      onClose={() => setOpen(false)}
      onCreated={() => setOpen(false)}
    />
  );
}