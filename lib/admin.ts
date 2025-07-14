import { auth } from "@clerk/nextjs"

const adminIds = [
  "user_2ykXdHYKw84WR8AxbuNJ4ED0B6v",
];

export const isAdmin = () => {
  const { userId } = auth();

  if (!userId) {
    return false;
  }

  return adminIds.indexOf(userId) !== -1;
};
