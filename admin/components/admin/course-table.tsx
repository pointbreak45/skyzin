"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { coursesAPI, Course } from "@/lib/api"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import Link from "next/link"
import { Star, TrendingUp, Eye } from "lucide-react"
import { useDeviceType, useResponsiveBreakpoint } from "@/hooks/use-mobile"

export function CourseTable() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [updatingFeatures, setUpdatingFeatures] = useState<{[key: string]: boolean}>({})
  const { isMobile, isZFold, deviceType } = useDeviceType()
  const breakpoint = useResponsiveBreakpoint()

  // Removed WebSocket - using regular API updates instead

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      // Fetch directly from API with proper error handling
      const response = await fetch('http://localhost:5000/api/courses', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })
      
      if (response.ok) {
        const result = await response.json()
        const courseData = result.data?.courses || result.courses || result || []
        
        // Ensure each course has proper title and instructor data
        const processedCourses = courseData.map((course: any) => ({
          ...course,
          title: course.title || 'Untitled Course',
          instructorName: course.instructorName || course.instructor?.name || 'Unknown Instructor',
          price: course.price || 0,
          duration: course.duration || 0,
          featured: course.featured || false,
          trending: course.trending || false,
          comingSoon: course.comingSoon || false,
          status: course.status || 'Draft',
          isActive: course.isActive !== undefined ? course.isActive : true
        }))
        
        setCourses(processedCourses)
        console.log(`Loaded ${processedCourses.length} courses`)
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error: any) {
      console.error("Error fetching courses:", error)
      if (error.message.includes('Failed to fetch')) {
        toast.error("Backend server not available. Please start the backend server.")
      } else {
        toast.error("Failed to load courses. Please try again.")
      }
      setCourses([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (courseId: string) => {
    const course = courses.find(c => c._id === courseId)
    const confirmMessage = course?.status === 'Published' 
      ? `Are you sure you want to delete "${course.title}"? This will permanently remove the course and cannot be undone. Consider unpublishing it first if you want to keep the data.`
      : `Are you sure you want to delete "${course?.title}"? This action cannot be undone.`
    
    if (!confirm(confirmMessage)) {
      return
    }

    try {
      // Use direct fetch for better error handling
      const token = localStorage.getItem('authToken') || localStorage.getItem('token') || localStorage.getItem('adminToken') || localStorage.getItem('admin_token')
      
      const response = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setCourses(prevCourses => prevCourses.filter(c => c._id !== courseId))
        toast.success(`Course "${course?.title}" deleted successfully`, {
          description: 'The course has been permanently removed from the system'
        })
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }
    } catch (error: any) {
      console.error("Error deleting course:", error)
      if (error.message.includes('Failed to fetch')) {
        toast.error('Backend server not available. Please ensure the backend is running.')
      } else if (error.message.includes('404')) {
        toast.error('Course not found. It may have already been deleted.')
      } else if (error.message.includes('403') || error.message.includes('401')) {
        toast.error('Access denied. Please check your permissions.')
      } else {
        toast.error(`Failed to delete course: ${error.message}`)
      }
    }
  }

  const handleToggleStatus = async (courseId: string) => {
    const course = courses.find(c => c._id === courseId)
    if (!course) return
    
    const newStatus = course.status === 'Published' && course.isActive ? 'Draft' : 'Published'
    const actionText = newStatus === 'Published' ? 'publish' : 'unpublish'
    const confirmMessage = newStatus === 'Draft' 
      ? `Are you sure you want to unpublish "${course.title}"? Students will no longer be able to enroll or access this course.`
      : `Are you sure you want to publish "${course.title}"? It will become available to all students.`
    
    if (!confirm(confirmMessage)) {
      return
    }

    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token') || localStorage.getItem('adminToken') || localStorage.getItem('admin_token')
      
      const response = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          status: newStatus,
          isActive: newStatus === 'Published'
        })
      })

      if (response.ok) {
        const result = await response.json()
        setCourses(prevCourses => 
          prevCourses.map(c => 
            c._id === courseId 
              ? { ...c, status: newStatus, isActive: newStatus === 'Published' }
              : c
          )
        )
        toast.success(`Course "${course.title}" ${actionText}ed successfully`, {
          description: newStatus === 'Published' 
            ? 'The course is now live and available to students'
            : 'The course is now hidden from students and enrollment is disabled'
        })
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }
    } catch (error: any) {
      console.error("Error updating course status:", error)
      if (error.message.includes('Failed to fetch')) {
        toast.error('Backend server not available. Please ensure the backend is running.')
      } else if (error.message.includes('403') || error.message.includes('401')) {
        toast.error('Access denied. Please check your permissions.')
      } else {
        toast.error(`Failed to ${actionText} course: ${error.message}`)
      }
    }
  }

  const handleToggleFeatured = async (courseId: string, currentFeatured: boolean) => {
    console.log(`Toggling featured status for course ${courseId}: ${currentFeatured} -> ${!currentFeatured}`)
    setUpdatingFeatures(prev => ({ ...prev, [`featured-${courseId}`]: true }))
    
    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('authToken') || localStorage.getItem('token') || localStorage.getItem('adminToken')
      
      if (!token) {
        console.error('No authentication token found')
        toast.error('Authentication required. Please login again.')
        return
      }
      
      console.log(`Making request to update course ${courseId} featured status with token: ${token.slice(0, 10)}...`)

      const response = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          featured: !currentFeatured 
        })
      })

      if (response.ok) {
        const result = await response.json()
        setCourses(prevCourses => 
          prevCourses.map(course => 
            course._id === courseId ? { ...course, featured: !currentFeatured } : course
          )
        )
        toast.success(`Course ${!currentFeatured ? 'added to' : 'removed from'} featured list`, {
          description: 'Users will see this change immediately'
        })
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }
    } catch (error: any) {
      console.error('Error updating featured status:', error)
      if (error.message.includes('Failed to fetch')) {
        toast.error('Backend server not available. Please ensure the backend is running.')
      } else {
        toast.error(`Failed to update featured status: ${error.message}`)
      }
    } finally {
      setUpdatingFeatures(prev => ({ ...prev, [`featured-${courseId}`]: false }))
    }
  }

  const handleToggleTrending = async (courseId: string, currentTrending: boolean) => {
    console.log(`Toggling trending status for course ${courseId}: ${currentTrending} -> ${!currentTrending}`)
    setUpdatingFeatures(prev => ({ ...prev, [`trending-${courseId}`]: true }))
    
    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('authToken') || localStorage.getItem('token') || localStorage.getItem('adminToken')
      
      if (!token) {
        console.error('No authentication token found for trending toggle')
        toast.error('Authentication required. Please login again.')
        return
      }
      
      console.log(`Making trending request for course ${courseId} with token: ${token.slice(0, 10)}...`)

      const response = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          trending: !currentTrending 
        })
      })

      if (response.ok) {
        const result = await response.json()
        setCourses(prevCourses => 
          prevCourses.map(course => 
            course._id === courseId ? { ...course, trending: !currentTrending } : course
          )
        )
        toast.success(`Course ${!currentTrending ? 'added to' : 'removed from'} trending list`, {
          description: 'Users will see this change immediately'
        })
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }
    } catch (error: any) {
      console.error('Error updating trending status:', error)
      if (error.message.includes('Failed to fetch')) {
        toast.error('Backend server not available. Please ensure the backend is running.')
      } else {
        toast.error(`Failed to update trending status: ${error.message}`)
      }
    } finally {
      setUpdatingFeatures(prev => ({ ...prev, [`trending-${courseId}`]: false }))
    }
  }

  const handleToggleComingSoon = async (courseId: string, currentComingSoon: boolean) => {
    setUpdatingFeatures(prev => ({ ...prev, [`coming-soon-${courseId}`]: true }))
    
    try {
      // Get auth token
      const token = localStorage.getItem('admin_token') || localStorage.getItem('authToken') || localStorage.getItem('token') || localStorage.getItem('adminToken')
      
      if (!token) {
        toast.error('Authentication required. Please login again.')
        return
      }

      const response = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          comingSoon: !currentComingSoon 
        })
      })

      if (response.ok) {
        const result = await response.json()
        const updatedCourse = result.data || result
        
        setCourses(prevCourses => 
          prevCourses.map(course => 
            course._id === courseId ? { ...course, comingSoon: !currentComingSoon } : course
          )
        )
        toast.success(`Course ${!currentComingSoon ? 'marked as' : 'removed from'} Coming Soon`, {
          description: 'Users will see this change immediately'
        })
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error: any) {
      console.error('Error updating coming soon status:', error)
      if (error.message.includes('401') || error.message.includes('403')) {
        toast.error('Authentication failed. Please login again.')
      } else if (error.message.includes('404')) {
        toast.error('Course not found.')
      } else if (error.message.includes('Failed to fetch')) {
        toast.error('Backend server not available. Please ensure the backend is running.')
      } else {
        toast.error(`Failed to update coming soon status: ${error.message}`)
      }
    } finally {
      setUpdatingFeatures(prev => ({ ...prev, [`coming-soon-${courseId}`]: false }))
    }
  }

  const formatPrice = (price: number) => `₹${price.toFixed(0)}`
  const capitalizeLevel = (level: string) => level.charAt(0).toUpperCase() + level.slice(1)
  
  // Mobile-friendly course card component
  const CourseCard = ({ course }: { course: Course }) => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Course Title and Price */}
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-medium text-sm line-clamp-2 pr-2" title={course.title}>
                {course.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {Math.round(course.duration/60)}h {course.duration%60}m • {capitalizeLevel(course.level)}
              </p>
            </div>
            <div className="text-sm font-semibold text-right">
              {formatPrice(course.price)}
            </div>
          </div>
          
          {/* Status and Badges */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Badge
                variant={course.status === 'Published' && course.isActive ? "default" : 
                        course.status === 'Draft' ? "secondary" : "destructive"}
                className="text-xs"
              >
                {course.status === 'Published' && course.isActive ? "Published" : 
                 course.status === 'Draft' ? "Draft" : 
                 course.status === 'Archived' ? "Archived" : "Inactive"}
              </Badge>
              {course.stats?.enrollmentCount && (
                <span className="text-xs text-gray-500">
                  {course.stats.enrollmentCount} enrolled
                </span>
              )}
            </div>
            
            {/* Feature Switches - Compact */}
            <div className="flex items-center gap-1">
              {course.featured && <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />}
              {course.trending && <TrendingUp className="h-3 w-3 text-red-500" />}
              {course.comingSoon && <Badge variant="outline" className="text-xs text-blue-600 border-blue-600">Soon</Badge>}
            </div>
          </div>
          
          {/* Feature Toggles - Only show most important ones on mobile */}
          {!isZFold && (
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div className="flex items-center gap-3 text-xs">
                <label className="flex items-center gap-1">
                  <span>Featured:</span>
                  <Switch
                    checked={course.featured || false}
                    onCheckedChange={() => handleToggleFeatured(course._id, course.featured || false)}
                    disabled={updatingFeatures[`featured-${course._id}`]}
                    className="data-[state=checked]:bg-yellow-500 scale-75"
                  />
                </label>
                <label className="flex items-center gap-1">
                  <span>Trending:</span>
                  <Switch
                    checked={course.trending || false}
                    onCheckedChange={() => handleToggleTrending(course._id, course.trending || false)}
                    disabled={updatingFeatures[`trending-${course._id}`]}
                    className="data-[state=checked]:bg-red-500 scale-75"
                  />
                </label>
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button asChild size="sm" variant="outline" className="flex-1 text-xs h-8">
              <Link href={`/courses/${course._id}/edit`}>Edit</Link>
            </Button>
            <Button
              size="sm"
              variant={course.isActive && course.status === 'Published' ? "outline" : "default"}
              onClick={() => handleToggleStatus(course._id)}
              className="flex-1 text-xs h-8"
            >
              {course.isActive && course.status === 'Published' ? "Unpublish" : "Publish"}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleDelete(course._id)}
              className="text-xs h-8 px-2"
            >
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
  
  // Filter courses based on active tab
  const getFilteredCourses = () => {
    switch (activeTab) {
      case 'featured':
        return courses.filter(course => course.featured)
      case 'trending':
        return courses.filter(course => course.trending)
      case 'published':
        return courses.filter(course => course.status === 'Published' && course.isActive && !course.comingSoon)
      case 'coming-soon':
        return courses.filter(course => course.comingSoon)
      case 'now-available':
        return courses.filter(course => course.isNewlyAvailable)
      case 'draft':
        return courses.filter(course => course.status === 'Draft')
      default:
        return courses
    }
  }
  
  const filteredCourses = getFilteredCourses()
  
  // Get course counts for tabs
  const courseCounts = {
    all: courses.length,
    featured: courses.filter(c => c.featured).length,
    trending: courses.filter(c => c.trending).length,
    published: courses.filter(c => c.status === 'Published' && c.isActive && !c.comingSoon).length,
    'coming-soon': courses.filter(c => c.comingSoon).length,
    'now-available': courses.filter(c => c.isNewlyAvailable).length,
    draft: courses.filter(c => c.status === 'Draft').length
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Course List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-40">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-32" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Course Management</span>
          <Badge variant="secondary">{courses.length} total courses</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="all" className="flex items-center gap-1 text-xs">
              <Eye className="h-3 w-3" />
              All ({courseCounts.all})
            </TabsTrigger>
            <TabsTrigger value="featured" className="flex items-center gap-1 text-xs">
              <Star className="h-3 w-3" />
              Featured ({courseCounts.featured})
            </TabsTrigger>
            <TabsTrigger value="trending" className="flex items-center gap-1 text-xs">
              <TrendingUp className="h-3 w-3" />
              Trending ({courseCounts.trending})
            </TabsTrigger>
            <TabsTrigger value="published" className="text-xs">
              Published ({courseCounts.published})
            </TabsTrigger>
            <TabsTrigger value="coming-soon" className="text-xs">
              Coming Soon ({courseCounts['coming-soon']})
            </TabsTrigger>
            <TabsTrigger value="now-available" className="text-xs">
              Now Available ({courseCounts['now-available']})
            </TabsTrigger>
            <TabsTrigger value="draft" className="text-xs">
              Draft ({courseCounts.draft})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {filteredCourses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No courses found in this category.</p>
                {activeTab !== 'all' && (
                  <p className="text-sm mt-2">
                    {activeTab === 'featured' && 'Use the Featured toggle to add courses to this list.'}
                    {activeTab === 'trending' && 'Use the Trending toggle to add courses to this list.'}
                    {activeTab === 'published' && 'Publish some courses to see them here.'}
                    {activeTab === 'draft' && 'Create new courses or unpublish existing ones to see them here.'}
                  </p>
                )}
              </div>
            ) : (
              {isMobile ? (
                // Mobile card layout
                <div className="space-y-3">
                  {filteredCourses.map((course) => (
                    <CourseCard key={course._id} course={course} />
                  ))}
                </div>
              ) : (
                // Desktop table layout
                <div className={`w-full overflow-x-auto ${isZFold ? 'table-cell-compact' : ''}`}>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className={isZFold ? 'table-header-compact' : ''}>Title</TableHead>
                        <TableHead className={`${isZFold ? 'table-header-compact' : ''} col-priority-1`}>Price</TableHead>
                        <TableHead className={`${isZFold ? 'table-header-compact' : ''} col-priority-3`}>Level</TableHead>
                        <TableHead className={`${isZFold ? 'table-header-compact' : ''} col-priority-4`}>Duration</TableHead>
                        <TableHead className={`${isZFold ? 'table-header-compact' : ''} col-priority-2`}>Status</TableHead>
                        <TableHead className={`text-center ${isZFold ? 'table-header-compact' : ''} col-priority-4`}>Featured</TableHead>
                        <TableHead className={`text-center ${isZFold ? 'table-header-compact' : ''} col-priority-4`}>Trending</TableHead>
                        <TableHead className={`text-center ${isZFold ? 'table-header-compact' : ''} col-priority-5`}>Coming Soon</TableHead>
                        <TableHead className={`${isZFold ? 'table-header-compact w-32' : 'w-60'}`}>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCourses.map((course) => (
                        <TableRow key={course._id}>
                          <TableCell className={`font-medium max-w-xs ${isZFold ? 'table-cell-compact' : ''}`}>
                            <div className="truncate" title={course.title}>
                              {course.title}
                            </div>
                          </TableCell>
                          <TableCell className={`font-semibold col-priority-1 ${isZFold ? 'table-cell-compact' : ''}`}>
                            {formatPrice(course.price)}
                          </TableCell>
                          <TableCell className={`col-priority-3 ${isZFold ? 'table-cell-compact' : ''}`}>
                            <Badge variant="outline" className={isZFold ? 'text-xs px-1' : ''}>
                              {capitalizeLevel(course.level)}
                            </Badge>
                          </TableCell>
                          <TableCell className={`col-priority-4 ${isZFold ? 'table-cell-compact' : ''}`}>
                            {Math.round(course.duration/60)}h {course.duration%60}m
                          </TableCell>
                          <TableCell className={`col-priority-2 ${isZFold ? 'table-cell-compact' : ''}`}>
                            <div className="flex flex-col gap-1">
                              <Badge
                                variant={course.status === 'Published' && course.isActive ? "default" : 
                                        course.status === 'Draft' ? "secondary" : "destructive"}
                                className={`w-fit ${isZFold ? 'text-xs px-1' : ''}`}
                              >
                                {course.status === 'Published' && course.isActive ? "Published" : 
                                 course.status === 'Draft' ? "Draft" : 
                                 course.status === 'Archived' ? "Archived" : "Inactive"}
                              </Badge>
                              {course.stats?.enrollmentCount && !isZFold && (
                                <span className="text-xs text-gray-500">
                                  {course.stats.enrollmentCount} enrolled
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className={`text-center col-priority-4 ${isZFold ? 'table-cell-compact' : ''}`}>
                            <div className="flex items-center justify-center">
                              <Switch
                                checked={course.featured || false}
                                onCheckedChange={() => handleToggleFeatured(course._id, course.featured || false)}
                                disabled={updatingFeatures[`featured-${course._id}`]}
                                className={`data-[state=checked]:bg-yellow-500 ${isZFold ? 'scale-75' : ''}`}
                              />
                              {course.featured && !isZFold && (
                                <Star className="h-4 w-4 ml-2 text-yellow-500 fill-yellow-500" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell className={`text-center col-priority-4 ${isZFold ? 'table-cell-compact' : ''}`}>
                            <div className="flex items-center justify-center">
                              <Switch
                                checked={course.trending || false}
                                onCheckedChange={() => handleToggleTrending(course._id, course.trending || false)}
                                disabled={updatingFeatures[`trending-${course._id}`]}
                                className={`data-[state=checked]:bg-red-500 ${isZFold ? 'scale-75' : ''}`}
                              />
                              {course.trending && !isZFold && (
                                <TrendingUp className="h-4 w-4 ml-2 text-red-500" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell className={`text-center col-priority-5 ${isZFold ? 'table-cell-compact' : ''}`}>
                            <div className="flex items-center justify-center">
                              <Switch
                                checked={course.comingSoon || false}
                                onCheckedChange={() => handleToggleComingSoon(course._id, course.comingSoon || false)}
                                disabled={updatingFeatures[`coming-soon-${course._id}`]}
                                className={`data-[state=checked]:bg-blue-500 ${isZFold ? 'scale-75' : ''}`}
                              />
                              {course.comingSoon && !isZFold && (
                                <Badge variant="outline" className="ml-2 text-blue-600 border-blue-600">
                                  Soon
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className={isZFold ? 'table-cell-compact' : ''}>
                            <div className={`flex gap-1 ${isZFold ? 'flex-col' : 'flex-wrap'}`}>
                              <Button asChild size="sm" variant="outline" className={isZFold ? 'text-xs h-7' : ''}>
                                <Link href={`/courses/${course._id}/edit`}>Edit</Link>
                              </Button>
                              {!isZFold && (
                                <Button asChild size="sm" variant="ghost">
                                  <Link href={`/courses/${course._id}/analytics`}>Analytics</Link>
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant={course.isActive && course.status === 'Published' ? "outline" : "default"}
                                onClick={() => handleToggleStatus(course._id)}
                                title={course.isActive && course.status === 'Published' ? 'Hide course from students' : 'Make course available to students'}
                                className={isZFold ? 'text-xs h-7' : ''}
                              >
                                {course.isActive && course.status === 'Published' ? "Unpublish" : "Publish"}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(course._id)}
                                title="Permanently delete this course"
                                className={isZFold ? 'text-xs h-7' : ''}
                              >
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
