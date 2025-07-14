import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { TodoBoardClient } from "@/components/todo/todo-board-client";

interface Props {
  params: { courseId: string };
}

const TodoPage = async ({ params }: Props) => {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");

  const courseId = Number(params.courseId);
  if (Number.isNaN(courseId)) redirect("/courses");

  return <TodoBoardClient courseId={courseId} />;
};

export default TodoPage;
