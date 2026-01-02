import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Newsletter Editor</h1>
        <p className="text-gray-600 mb-8">Create beautiful newsletters with drag and drop</p>
        <Link href="/newsletter/editor">
          <Button size="lg">Open Editor</Button>
        </Link>
      </div>
    </div>
  );
}

