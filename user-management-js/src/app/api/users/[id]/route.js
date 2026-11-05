import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createUserSchema, updateUserSchema, } from "@/lib/validations/user";
const uuidSchema = z.string().uuid();
function isUniqueViolation(error) {
    return (typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "23505");
}
function invalidIdResponse() {
    return NextResponse.json({ success: false, message: "Invalid user ID" }, { status: 400 });
}
export async function GET(_request, context) {
    try {
        const { id } = await context.params;
        if (!uuidSchema.safeParse(id).success)
            return invalidIdResponse();
        const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: user });
    }
    catch (error) {
        console.error("GET /api/users/[id] error:", error);
        return NextResponse.json({ success: false, message: "Unable to fetch user" }, { status: 500 });
    }
}
// PUT replaces all editable user fields.
export async function PUT(request, context) {
    try {
        const { id } = await context.params;
        if (!uuidSchema.safeParse(id).success)
            return invalidIdResponse();
        const body = await request.json();
        const parsed = createUserSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({
                success: false,
                message: "Please provide valid user details",
                errors: parsed.error.flatten().fieldErrors,
            }, { status: 400 });
        }
        const [updatedUser] = await db
            .update(users)
            .set({
            name: parsed.data.name,
            email: parsed.data.email.toLowerCase(),
            phone: parsed.data.phone,
            age: parsed.data.age ?? null,
            updatedAt: new Date(),
        })
            .where(eq(users.id, id))
            .returning();
        if (!updatedUser) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }
        return NextResponse.json({
            success: true,
            message: "User updated successfully",
            data: updatedUser,
        });
    }
    catch (error) {
        if (isUniqueViolation(error)) {
            return NextResponse.json({ success: false, message: "A user with this email already exists" }, { status: 409 });
        }
        console.error("PUT /api/users/[id] error:", error);
        return NextResponse.json({ success: false, message: "Unable to update user" }, { status: 500 });
    }
}
// PATCH updates only the fields included in the request body.
export async function PATCH(request, context) {
    try {
        const { id } = await context.params;
        if (!uuidSchema.safeParse(id).success)
            return invalidIdResponse();
        const body = await request.json();
        const parsed = updateUserSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({
                success: false,
                message: "Please provide valid fields to update",
                errors: parsed.error.flatten().fieldErrors,
            }, { status: 400 });
        }
        const [updatedUser] = await db
            .update(users)
            .set({
            ...parsed.data,
            ...(parsed.data.email !== undefined
                ? { email: parsed.data.email.toLowerCase() }
                : {}),
            updatedAt: new Date(),
        })
            .where(eq(users.id, id))
            .returning();
        if (!updatedUser) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }
        return NextResponse.json({
            success: true,
            message: "User updated successfully",
            data: updatedUser,
        });
    }
    catch (error) {
        if (isUniqueViolation(error)) {
            return NextResponse.json({ success: false, message: "A user with this email already exists" }, { status: 409 });
        }
        console.error("PATCH /api/users/[id] error:", error);
        return NextResponse.json({ success: false, message: "Unable to update user" }, { status: 500 });
    }
}
export async function DELETE(_request, context) {
    try {
        const { id } = await context.params;
        if (!uuidSchema.safeParse(id).success)
            return invalidIdResponse();
        const [deletedUser] = await db
            .delete(users)
            .where(eq(users.id, id))
            .returning({ id: users.id });
        if (!deletedUser) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }
        return NextResponse.json({
            success: true,
            message: "User deleted successfully",
            data: deletedUser,
        });
    }
    catch (error) {
        console.error("DELETE /api/users/[id] error:", error);
        return NextResponse.json({ success: false, message: "Unable to delete user" }, { status: 500 });
    }
}
