import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { adminSidebarNavigation, type AdminNavigationItem } from '@/config/navigationItem'

export default clerkMiddleware(async (auth, request: NextRequest) => {
    const pathname = request.nextUrl.pathname
    const { userId } = await auth()


    // Define protected routes from admin navigation
    const collectPaths = (items: AdminNavigationItem[]): string[] =>
        items.flatMap((item) => [
            ...(item.href ? [item.href] : []),
            ...(item.children ? collectPaths(item.children) : [])
        ])

    const protectedPaths = collectPaths(adminSidebarNavigation)
    const isProtected = protectedPaths.some(path => pathname.startsWith(path))

    // If route is protected and user is not authenticated, redirect to home
    if (isProtected && !userId) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    return NextResponse.next()
})


export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
}
