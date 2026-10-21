"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

export function PostActions({ post, projectId }: { post: any; projectId: string }) {
  return (
    <Link href={`/projects/${projectId}/content/${post.id}`}>
      <Button variant="ghost" size="sm">
        <Pencil className="w-3.5 h-3.5" />
      </Button>
    </Link>
  );
}
