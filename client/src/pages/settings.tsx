import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { auth } from "../lib/firebase";
import { updateProfile } from "firebase/auth";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "../contexts/AuthContext";
import { Settings, User, Bell, Key, Shield } from "lucide-react";

// Form schema
const profileFormSchema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
});

const notificationFormSchema = z.object({
  salesNotifications: z.boolean().default(true),
  returnsNotifications: z.boolean().default(true),
  paymentNotifications: z.boolean().default(true),
  systemNotifications: z.boolean().default(true),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type NotificationFormValues = z.infer<typeof notificationFormSchema>;

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { currentUser } = useAuth();
  
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: currentUser?.displayName || "",
      email: currentUser?.email || "",
    },
  });
  
  const notificationForm = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      salesNotifications: true,
      returnsNotifications: true,
      paymentNotifications: true,
      systemNotifications: true,
    },
  });
  
  const onUpdateProfile = async (data: ProfileFormValues) => {
    if (!currentUser) return;
    
    setLoading(true);
    
    try {
      // Only update display name for now (email requires verification)
      if (data.displayName !== currentUser.displayName) {
        await updateProfile(currentUser, {
          displayName: data.displayName
        });
        
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully"
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };
  
  const onUpdateNotifications = (data: NotificationFormValues) => {
    // In a real application, you would save these preferences to Firestore
    toast({
      title: "Notification preferences saved",
      description: "Your notification settings have been updated"
    });
  };
  
  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500">Manage your account settings and preferences</p>
        </div>
      </div>

      <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col md:flex-row gap-6">
          <Card className="md:w-64 p-2">
            <TabsList className="flex flex-col w-full items-start rounded-none space-y-1 p-0 bg-transparent">
              <TabsTrigger 
                value="profile"
                className={`w-full justify-start px-3 py-2 text-left ${activeTab === "profile" ? "bg-primary/10 text-primary" : ""}`}
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger 
                value="notifications"
                className={`w-full justify-start px-3 py-2 text-left ${activeTab === "notifications" ? "bg-primary/10 text-primary" : ""}`}
              >
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger 
                value="security"
                className={`w-full justify-start px-3 py-2 text-left ${activeTab === "security" ? "bg-primary/10 text-primary" : ""}`}
              >
                <Key className="h-4 w-4 mr-2" />
                Security
              </TabsTrigger>
              <TabsTrigger 
                value="appearance"
                className={`w-full justify-start px-3 py-2 text-left ${activeTab === "appearance" ? "bg-primary/10 text-primary" : ""}`}
              >
                <Settings className="h-4 w-4 mr-2" />
                Appearance
              </TabsTrigger>
            </TabsList>
          </Card>
          
          <div className="flex-1">
            <TabsContent value="profile" className="m-0">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  {!currentUser ? (
                    <div className="space-y-4">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ) : (
                    <Form {...profileForm}>
                      <form onSubmit={profileForm.handleSubmit(onUpdateProfile)} className="space-y-6">
                        <FormField
                          control={profileForm.control}
                          name="displayName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Display Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={profileForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input {...field} disabled />
                              </FormControl>
                              <FormMessage />
                              <p className="text-xs text-gray-500 mt-1">Email changes require verification and admin approval</p>
                            </FormItem>
                          )}
                        />
                        
                        <Button type="submit" disabled={loading}>
                          {loading ? "Updating..." : "Update Profile"}
                        </Button>
                      </form>
                    </Form>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications" className="m-0">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...notificationForm}>
                    <form onSubmit={notificationForm.handleSubmit(onUpdateNotifications)} className="space-y-6">
                      <div className="space-y-4">
                        <FormField
                          control={notificationForm.control}
                          name="salesNotifications"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Sales Notifications</FormLabel>
                                <p className="text-sm text-gray-500">Receive notifications about new sales and invoices</p>
                              </div>
                              <FormControl>
                                <Switch 
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={notificationForm.control}
                          name="returnsNotifications"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Returns Notifications</FormLabel>
                                <p className="text-sm text-gray-500">Receive notifications about product returns</p>
                              </div>
                              <FormControl>
                                <Switch 
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={notificationForm.control}
                          name="paymentNotifications"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Payment Notifications</FormLabel>
                                <p className="text-sm text-gray-500">Receive notifications about new payments</p>
                              </div>
                              <FormControl>
                                <Switch 
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={notificationForm.control}
                          name="systemNotifications"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">System Notifications</FormLabel>
                                <p className="text-sm text-gray-500">Receive notifications about system updates and maintenance</p>
                              </div>
                              <FormControl>
                                <Switch 
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <Button type="submit">Save Preferences</Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="security" className="m-0">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Change Password</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      For security reasons, please use the password reset function through the login page to change your password.
                    </p>
                    <Button variant="outline" onClick={() => auth.sendPasswordResetEmail(currentUser?.email || "")}>
                      Send Password Reset Email
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Session Management</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      You will be automatically logged out after 10 minutes of inactivity for security purposes.
                    </p>
                    <div className="flex items-center space-x-2">
                      <Shield className="h-5 w-5 text-green-500" />
                      <span className="text-sm font-medium text-green-600">
                        Automatic logout is enabled
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="appearance" className="m-0">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Theme</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Choose the application theme that works best for you.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="border rounded-lg p-4 flex flex-col items-center gap-2 bg-primary/5 border-primary">
                          <div className="w-full h-20 bg-white rounded border"></div>
                          <span className="text-sm font-medium">Light (Default)</span>
                        </div>
                        <div className="border rounded-lg p-4 flex flex-col items-center gap-2">
                          <div className="w-full h-20 bg-gray-900 rounded border border-gray-700"></div>
                          <span className="text-sm font-medium">Dark</span>
                        </div>
                        <div className="border rounded-lg p-4 flex flex-col items-center gap-2">
                          <div className="w-full h-20 bg-gradient-to-b from-white to-gray-900 rounded border"></div>
                          <span className="text-sm font-medium">System Default</span>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Layout Density</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Adjust the density of the user interface elements.
                      </p>
                      <div className="flex items-center space-x-4">
                        <Button variant="outline" className="border-primary text-primary">Comfortable</Button>
                        <Button variant="outline">Compact</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>Save Appearance</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
