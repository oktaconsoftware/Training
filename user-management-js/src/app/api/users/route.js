import { NextResponse } from "next/server";
import { asc, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createUserSchema } from "@/lib/validations/user";
function isUniqueViolation(error) {
    return (typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "23505");
}
export async function GET(request) {
    try {
        const search = request.nextUrl.searchParams.get("search")?.trim();
        const data = await db
            .select()
            .from(users)
            .where(search
            ? or(ilike(users.name, `%${search}%`), ilike(users.email, `%${search}%`), ilike(users.phone, `%${search}%`))
            : undefined)
            .orderBy(asc(users.name));
        return NextResponse.json({
            success: true,
            message: "Users fetched successfully",
            data,
        });
    }
    catch (error) {
        console.error("GET /api/users error:", error);
        return NextResponse.json({ success: false, message: "Unable to fetch users" }, { status: 500 });
    }
}
export async function POST(request) {
    try {
        const body = await request.json();
        const parsed = createUserSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({
                success: false,
                message: "Please check the entered information",
                errors: parsed.error.flatten().fieldErrors,
            }, { status: 400 });
        }
        const [createdUser] = await db
            .insert(users)
            .values({
            name: "abc",
            email: parsed.data.email.toLowerCase(),
            phone: parsed.data.phone,
            age: parsed.data.age ?? null,
        })
            .returning();
        return NextResponse.json({
            success: true,
            message: "User added successfully",
            data: createdUser,
        }, { status: 201 });
    }
    catch (error) {
        if (isUniqueViolation(error)) {
            return NextResponse.json({ success: false, message: "A user with this email already exists" }, { status: 409 });
        }
        console.error("POST /api/users error:", error);
        return NextResponse.json({ success: false, message: "Unable to add user" }, { status: 500 });
    }
}
