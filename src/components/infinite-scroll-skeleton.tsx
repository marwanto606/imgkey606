 import { Card, CardContent } from "@/components/ui/card"
 import { Skeleton } from "@/components/ui/skeleton"
 
 export function InfiniteScrollSkeleton() {
   return (
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
       {Array.from({ length: 8 }).map((_, index) => (
         <Card key={index} className="overflow-hidden">
           <Skeleton className="w-full h-64" />
           <CardContent className="p-4">
             <Skeleton className="h-4 w-full mb-2" />
             <Skeleton className="h-4 w-3/4 mb-3" />
             <div className="flex items-center justify-between mb-3">
               <Skeleton className="h-3 w-20" />
               <Skeleton className="h-5 w-16" />
             </div>
             <Skeleton className="h-8 w-full" />
           </CardContent>
         </Card>
       ))}
     </div>
   )
 }