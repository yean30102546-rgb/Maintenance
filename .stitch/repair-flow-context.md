# Repair Job Module Context

## Overview
This document serves as a compacted context for the LLM regarding the Repair Job module in the MAINTENANCEAPP. It covers the database schema, the frontend submission flow, the server actions, and recent bug fixes.

## Database Schema (`RepairJob`)
The `RepairJob` table stores maintenance requests. Recent additions include:
- `imgBefore2`, `imgBefore3`: Support for up to 3 before-repair images.
- `side`: A string field indicating the specific side/location of the machine.
- `opType`: A string field indicating the operation type.

## Frontend (`CreateRepairForm.tsx`)
- Located at `src/app/(protected)/dashboard/_components/CreateRepairForm.tsx`.
- Uses `browser-image-compression` to compress up to 3 images before submitting to the server.
- Web Worker is **disabled** (`useWebWorker: false`) for `browser-image-compression` to prevent freezing in Next.js development mode.
- Manual validation is performed before calling the server action. If validation fails, `toast.error` is triggered.

## Backend / Server Actions (`actions/repair.ts`)
- Uses `FormData` to receive the data.
- **Authentication**: Supports both real Supabase Auth (`supabase.auth.getUser()`) AND a developer Mock Session (`mock_session_id` cookie). The `authId` falls back to `mock_session_id` if Supabase auth fails, preventing "Unauthorized" errors during local development without a real login.
- Uploads images to Supabase Storage bucket `repair-images` and retrieves public URLs.
- Inserts data using `prisma.repairJob.create()`.
- Calls `revalidatePath('/repair')` upon completion.

## Configuration (`next.config.ts`)
- Server Actions body size limit is increased to `10mb` to allow multiple image uploads simultaneously.
- Next.js 16 configuration format:
  ```ts
  const nextConfig: NextConfig = {
    experimental: {
      serverActions: {
        bodySizeLimit: '10mb',
      },
    },
  };
  ```

## Critical Fixes Applied
1. **Missing Toaster**: Added `<Toaster position="top-center" />` to `src/app/layout.tsx` (using `sonner`) to ensure `toast.error` and `toast.success` are visible to the user.
2. **Prisma Stale Schema**: Restarting `npm run dev` is required whenever the Prisma schema changes, otherwise Prisma throws an `Unknown arg` error and the Server Action fails silently if the `Toaster` is missing.
3. **Mock Login Compatibility**: `actions/repair.ts` was updated to read the `mock_session_id` cookie, ensuring parity with the `Dashboard` page access logic.

## Usage for Future Prompts
When modifying the repair submission flow:
1. Ensure the `FormData` keys match the exact names expected in `actions/repair.ts`.
2. Do not use Next.js `<form action={...}>` directly if image compression is needed prior to submission; instead, use an `onSubmit` handler with `e.preventDefault()`.
3. Be aware that the Next.js `bodySizeLimit` is set to 10MB in `next.config.ts` under the `experimental` flag.
