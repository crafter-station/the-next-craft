export function POST() {
  return Response.json(
    { error: "Badge generation is closed" },
    { status: 410 },
  );
}
