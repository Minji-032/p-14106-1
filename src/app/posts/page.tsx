"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Page() {
  const [posts, setPosts] = useState<{ id: number; title: string }[]>([]);
  useEffect(() => {          //useEffact로 한번만 실행해줌
   fetch("http://localhost:8080/api/v1/posts")
      .then((res) => res.json())
      .then(setPosts);    //.then((data) => setPost(data)); 와 같은 거
  }, []);  

  return (
    <>
      <h1>글 목록</h1>

      {posts.length == 0 && <div>로딩중...</div>}

      <ul>
        {posts.map((post) => (
          <li key={post.id}>
            <Link href={`/posts/${post.id}`}>{post.title}</Link>
          </li>
        ))}
      </ul>
    </>
  );
}