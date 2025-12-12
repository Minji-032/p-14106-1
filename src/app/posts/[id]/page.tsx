"use client";

import { apiFetch } from "@/lib/backend/client";
import type { PostCommentDto, PostWithContentDto } from "@/type/post";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

function usePost(id: number) {
  const [post, setPost] = useState<PostWithContentDto | null>(null);

  useEffect(() => {
    apiFetch(`/api/v1/posts/${id}`)
      .then(setPost)
      .catch((error) => {
        alert(`${error.resultCode} : ${error.msg}`);
      });
  }, []);

  const deletePost = (id: number, onSuccess: () => void) => {
    apiFetch(`/api/v1/posts/${id}`, {
      method: "DELETE",
    }).then(onSuccess);
  };

  return {
    post,
    deletePost,
  };
}

function usePostComments(postId: number) {
  const [postComments, setPostComments] = useState<PostCommentDto[] | null>(
    null
  );

  useEffect(() => {
    apiFetch(`/api/v1/posts/${postId}/comments`)
      .then(setPostComments)
      .catch((error) => {
        alert(`${error.resultCode} : ${error.msg}`);
      });
  }, []);

  const deleteComment = (commentId: number, onSuccess: (data: any) => void) => {
    apiFetch(`/api/v1/posts/${postId}/comments/${commentId}`, {
      method: "DELETE",
    }).then((data) => {
      if (postComments == null) return;

      setPostComments(postComments.filter((c) => c.id != commentId));

      onSuccess(data);
    });
  };

  const writeComment = (content: string, onSuccess: (data: any) => void) => {
    apiFetch(`/api/v1/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify({
        content,
      }),
    }).then((data) => {
      if (postComments == null) return;

      setPostComments([...postComments, data.data]);

      onSuccess(data);
    });
  };

  const modifyComment = (
    commentId: number,
    content: string,
    onSuccess: (data: any) => void
  ) => {
    apiFetch(`/api/v1/posts/${postId}/comments/${commentId}`, {
      method: "PUT",
      body: JSON.stringify({ content }),
    }).then((data) => {
      if (postComments == null) return;

      setPostComments(
        postComments.map((comment) =>
          comment.id === commentId ? { ...comment, content } : comment
        )
      );

      onSuccess(data);
    });
  };

  return {
    postId,
    postComments,
    deleteComment,
    writeComment,
    modifyComment,
  };
}

function PostInfo({ postState }: { postState: ReturnType<typeof usePost> }) {
  const router = useRouter();
  const { post, deletePost: _deletePost } = postState;

  if (post == null) return <div>로딩중...</div>;

  const deletePost = () => {
    if (!confirm(`${post.id}번 글을 정말로 삭제하시겠습니까?`)) return;

    _deletePost(post.id, () => {
      router.replace("/posts");
    });
  };

  return (
    <>
      <div>번호 : {post.id}</div>
      <div>제목: {post.title}</div>
      <div style={{ whiteSpace: "pre-line" }}>{post.content}</div>

      <div className="flex gap-2">
        <button className="p-1 rounded border" onClick={deletePost}>
          삭제
        </button>
        <Link className="p-1 rounded border" href={`/posts/${post.id}/edit`}>
          수정
        </Link>
      </div>
    </>
  );
}

function PostCommentWrite({
  postCommentsState,
}: {
  postCommentsState: ReturnType<typeof usePostComments>;
}) {
  const { postId, writeComment } = postCommentsState;

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

    writeComment(contentTextarea.value, (data) => {
      alert(data.msg);
      contentTextarea.value = "";
    });
  };

  return (
    <>
    <br />
      <h2 className="bg-yellow-200">{postId}번글에 대한 댓글 작성</h2>

      <form
        className="flex gap-2 items-end"
        onSubmit={handleCommentWriteFormSubmit}
      >
        <textarea
          className="border p-1 rounded"
          name="content"
          placeholder="댓글 내용"
          maxLength={100}
          rows={5}
        />
        <button className="p-1 rounded border" type="submit">
          작성
        </button>
      </form>
    </>
  );
}

function PostCommentListItem({
  comment,
  postCommentsState,
}: {
  comment: PostCommentDto;
  postCommentsState: ReturnType<typeof usePostComments>;
}) {
  const [modifyMode, setModifyMode] = useState(false);
  const { deleteComment: _deleteComment, modifyComment } = postCommentsState;

  const toggleModifyMode = () => {
    setModifyMode(!modifyMode);
  };

  const deleteComment = (commentId: number) => {
    if (!confirm(`${commentId}번 댓글을 정말로 삭제하시겠습니까?`)) return;

    _deleteComment(commentId, (data) => {
      alert(data.msg);
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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

    modifyComment(comment.id, contentTextarea.value, (data) => {
      alert(data.msg);
      toggleModifyMode();
    });
  };

  return (
    <li className="flex gap-2 items-start">
      <span>{comment.id} :</span>
      {!modifyMode && (
        <span style={{ whiteSpace: "pre-line" }}>{comment.content}</span>
      )}
      {modifyMode && (
        <form className="flex gap-2 items-start" onSubmit={handleSubmit}>
          <textarea
            className="border p-2 rounded"
            name="content"
            placeholder="댓글 내용"
            maxLength={100}
            rows={5}
            defaultValue={comment.content}
            autoFocus
          />
          <button className="p-1 rounded border" type="submit">
            저장
          </button>
        </form>
      )}
      <button className="p-1 rounded border" onClick={toggleModifyMode}>
        {modifyMode ? "수정취소" : "수정"}
      </button>
      <button
        className="p-1 rounded border"
        onClick={() => deleteComment(comment.id)}
      >
        삭제
      </button>
    </li>
  );
}

function PostCommentList({
  postCommentsState,
}: {
  postCommentsState: ReturnType<typeof usePostComments>;
}) {
  const { postId, postComments } = postCommentsState;

  if (postComments == null) return <div>로딩중...</div>;

  return (
    <>
    <br />
      <h2 className="bg-green-200">{postId}번 글에 대한 댓글 목록</h2>

      {postComments != null && postComments.length == 0 && (
        <div>댓글이 없습니다.</div>
      )}

      {postComments != null && postComments.length > 0 && (
        <ul className="mt-2 flex flex-col gap-2">
          {postComments.map((comment) => (
            <PostCommentListItem
              key={comment.id}
              comment={comment}
              postCommentsState={postCommentsState}
            />
          ))}
        </ul>
      )}
    </>
  );
}

function PostCommentWriteAndList({
  postCommentsState,
}: {
  postCommentsState: ReturnType<typeof usePostComments>;
}) {
  return (
    <>
      <PostCommentWrite postCommentsState={postCommentsState} />

      <PostCommentList postCommentsState={postCommentsState} />
    </>
  );
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = use(params);
  const id = parseInt(idStr);

  const postState = usePost(id);
  const postCommentsState = usePostComments(id);

  return (
    <>
      <h1 className="bg-red-200">글 상세페이지</h1>

      <PostInfo postState={postState} />

      <PostCommentWriteAndList postCommentsState={postCommentsState} />
    </>
  );
}