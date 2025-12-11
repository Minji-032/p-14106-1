"use client";

import { apiFetch } from "@/lib/backend/client";
import { useRouter } from "next/navigation";

export default function Page() {
	const router = useRouter();
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.target as HTMLFormElement;

    const titleInput = form.elements.namedItem("title") as HTMLInputElement;
    const contentTextarea = form.elements.namedItem(
      "content" 
    ) as HTMLTextAreaElement;

		titleInput.value = titleInput.value.trim();
		if (titleInput.value.length === 0) {
      alert("제목을 입력해주세요.");
      titleInput.focus();
      return;
    }

		if (titleInput.value.length < 2) {
      alert("제목을 2자 이상 입력해주세요.");
      titleInput.focus();
      return;
    }

		contentTextarea.value = contentTextarea.value.trim();
    if (contentTextarea.value.length === 0) {
      alert("내용을 입력해주세요.");
      contentTextarea.focus();
      return;
    }

		if (contentTextarea.value.length < 2) {
      alert("내용을 2자 이상 입력해주세요.");
      contentTextarea.focus();
      return;
    }


		apiFetch(`/api/v1/posts`, {
			method: "POST",
			body: JSON.stringify({
				title: titleInput.value,
				content: contentTextarea.value,
			}),
		})
      .then((data) => {
        alert(data.msg);
        router.replace(`/posts/${data.data.id}`);
      })
      .catch((error) => {
        alert(`${error.resultCode} : ${error.msg}`);
      });
		
  };

    return (
    <>
      <h1>글쓰기</h1>

      <form className="flex flex-col gap-2 p-2" onSubmit={handleSubmit}>
        <input
          className="border p-2 rounded"
          type="text"
          name="title"
          placeholder="제목"
					autoFocus
					maxLength={100}
        />
        <textarea
          className="border p-2 rounded"
          name="content"
          placeholder="내용"
					maxLength={5000}
					rows={10}
        />
        <button className="border p-2 rounded" type="submit">
          저장
        </button>
      </form>
    </>
  );
}