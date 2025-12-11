"use client";

import { apiFetch } from "@/lib/backend/client";
import type { PostCommentDto, PostWithContentDto } from "@/type/post";
import { use, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";


export default function Page({ params } : {params: Promise<{id:number}>}) {
  const { id: idStr } = useParams<{ id: string }>();
  const id = Number(idStr);
  const router = useRouter();
  const [post, setPost] = useState<PostWithContentDto | null>(null);
  const [postComments, setPostComments] = useState<PostCommentDto[] | null>(
    null
  );

  const deletePost = (id: number) => {
    apiFetch(`/api/v1/posts/${id}`, {
      method: "DELETE",
    }).then((data) => {
      alert(data.msg);
      router.replace("/posts");
    });
  };

  const deleteComment = (id: number, commentId: number) => {
    apiFetch(`/api/v1/posts/${id}/comments/${commentId}`, {
      method: "DELETE",
    }).then((data) =>{
      alert(data.msg);

      if (postComments == null) return;
      setPostComments(postComments.filter((c) => c.id != commentId));
    });
  };

  const handleCommentWriteFormSubmit = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const form = e.target as HTMLFormElement;

    const contentTextarea = form.elements.namedItem(
      "content"
    ) as HTMLTextAreaElement;

    contentTextarea.value = contentTextarea.value.trim();

    if (contentTextarea.value.length === 0) {
      alert("댓글 내용을 입력해주세요.");
      contentTextarea.focus();
      return;
    }
    if (contentTextarea.value.length < 2) {
      alert("댓글 내용을 2자 이상 입력해주세요.");
      contentTextarea.focus();
      return;
    }

    apiFetch(`/api/v1/posts/${id}/comments`, {
      method: "POST",
      body: JSON.stringify({
        content: contentTextarea.value,
      }),
    }).then((data) => {
      alert(data.msg);
      contentTextarea.value = "";

      if(postComments == null) return;
      setPostComments([...postComments, data.data]);
    });
  };

  useEffect(() => {
    apiFetch(`/api/v1/posts/${id}`)
      .then(setPost)
      .catch((error)=> {
        alert(error.message);
      });

    apiFetch(`/api/v1/posts/${id}/comments`)
      .then(setPostComments)
      .catch((error)=>{
        alert(error.message);
      });
  }, []);


  if (post == null) return <div>로딩중...</div>;

  return (
    <>
      <h1>글 상세페이지</h1>

      <div>번호 : {post.id}</div>
      <div>제목: {post.title}</div>
      <div style={{ whiteSpace: "pre-line" }}>{post.content}</div>
      <div className="flex gap-2">
        <button
          className="p-2 rounded border"
          onClick={() => confirm(`${post.id}번 글을 정말로 삭제하시겠습니까?`) && deletePost(post.id)}
        >
          삭제
        </button>
        <Link className="p-2 rounded border" href={`/posts/${post.id}/edit`}>
          수정
        </Link>
      </div>
      

      <br />
      <h2>댓글 작성</h2>

      <form className="p-2 bg-green-100" onSubmit={handleCommentWriteFormSubmit}>
        <textarea
          className="border p-2 rounded"
          name="content"
          placeholder="댓글 내용"
          maxLength={100}
          rows={5}
        />
        <button className="p-1 rounded border bg-green-300 hover:bg-green-600 hover:text-white" type="submit">
          작성
        </button>
      </form>


      <br />
      <h2>댓글 목록</h2>

      {postComments == null && <div>댓글 로딩중...</div>}

      {postComments != null && postComments?.length == 0 && (
        <div>댓글이 없습니다.</div>
      )}

      {postComments != null && postComments.length > 0 && (
        <ul>
          {postComments.map((comment) => (
            <li key={comment.id} className="p-1 border bg-blue-100">
              {comment.id} : {comment.content}
              <button
                className="p-1 rounded border bg-blue-300 hover:bg-blue-600 hover:text-white"
                onClick={() =>
                  confirm(`${comment.id}번 댓글을 정말로 삭제하시겠습니까?`) &&
                  deleteComment(id, comment.id)
                }
                >삭제
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}