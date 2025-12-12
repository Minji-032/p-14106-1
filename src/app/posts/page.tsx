"use client";

import { apiFetch } from "@/lib/backend/client";
import type { PostDto } from "@/type/post";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Page() {
  const [posts, setPosts] = useState<PostDto[] | null>(null);
  useEffect(() => {          //useEffact로 한번만 실행해줌
    apiFetch(`/api/v1/posts`).then(setPosts);
  }, []);  

  if (posts == null) return <div>로딩중...</div>;

  return (
    <>
      <h1 className="bg-red-200">글 목록</h1>

      {posts.length == 0 && <div>글이 없습니다.</div>}

      {posts.length > 0 && (
        <ul>
           {posts.map((post) => (
            <li key={post.id} className="p-1">
              - <Link href={`/posts/${post.id}`}>{post.title}</Link>
            </li>
          ))}
        </ul>
      )}
      <div>
        <Link href="/posts/write" className="border p-1 rounded hover:bg-blue-200">글쓰기</Link>
      </div>
    </>
  );
}