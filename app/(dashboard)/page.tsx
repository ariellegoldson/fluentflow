"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Users, 
  ClipboardCheck, 
  TrendingUp,
  Plus,
  Clock,
  Target,
  FileText
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const stats = [
  { name: "Today's Sessions", value: "6", icon: Calendar, color: "bg-blue-100 text-blue-600" },
  { name: "Active Students", value: "24", icon: Users, color: "bg-green-100 text-green-600" },
  { name: "Sessions This Week", value: "18", icon: ClipboardCheck, color: "bg-purple-100 text-purple-600" },
  { name: "Goals Tracked", value: "72", icon: Target, color: "bg-pink-100 text-pink-600" },
];

const quickActions = [
  { name: "New Session", href: "/schedule", icon: Plus },
  { name: "Add Student", href: "/students/new", icon: Users },
  { name: "View Reports", href: "/reports", icon: FileText },
  { name: "Today's Schedule", href: "/schedule", icon: Clock },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's your overview for today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.name}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <Link key={action.name} href={action.href}>
                  <Button variant="outline" className="w-full justify-start">
                    <action.icon className="mr-2 h-4 w-4" />
                    {action.name}
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-[var(--brand-pink-light)] rounded-xl">
                <div>
                  <p className="font-medium">Emma Thompson</p>
                  <p className="text-sm text-gray-600">9:00 AM - Speech Room</p>
                </div>
                <Button size="sm">View</Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium">Liam Chen & Noah Williams</p>
                  <p className="text-sm text-gray-600">9:45 AM - Speech Room (Group)</p>
                </div>
                <Button size="sm" variant="outline">View</Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium">Ava Patel</p>
                  <p className="text-sm text-gray-600">1:00 PM - Speech Room</p>
                </div>
                <Button size="sm" variant="outline">View</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <span className="text-gray-600">Session completed with Emma Thompson</span>
              <span className="ml-auto text-gray-500">2 hours ago</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <span className="text-gray-600">Progress report generated for Liam Chen</span>
              <span className="ml-auto text-gray-500">Yesterday</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
              <span className="text-gray-600">New goal added for Sophia Rodriguez</span>
              <span className="ml-auto text-gray-500">2 days ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}