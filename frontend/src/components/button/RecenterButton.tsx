"use client";
import { Button } from '@base-ui/react/button';
import { MapPin } from 'lucide-react';

type RecenterButtonProps = Readonly<{
  onClick: () => void;
}>;

const RecenterButton = ({ onClick }: RecenterButtonProps) => {
  return (
    <Button onClick={onClick} className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-50 hover:bg-gray-100 active:bg-gray-200 p-0">
      <MapPin className="h-5 w-5 text-gray-900" />
    </Button>
  );
};

export { RecenterButton };