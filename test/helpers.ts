import { PrismaService } from "@/prisma/prisma.service";

export async function cleanDB(prisma: PrismaService) {
  await prisma.publication.deleteMany();
  await prisma.media.deleteMany();
  await prisma.post.deleteMany();
}
