import { useState, useEffect } from "react";
import { db, auth } from "../../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogTrigger 
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Shield, UserPlus } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "../../contexts/AuthContext";

export default function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const { toast } = useToast();
  const { currentUser } = useAuth();
  
  const [newUser, setNewUser] = useState({
    email: "",
    displayName: "",
    role: "user",
  });
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRef = collection(db, "users");
        const snapshot = await getDocs(usersRef);
        const usersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          lastLogin: doc.data().lastLogin?.toDate(),
        }));
        
        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load users"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [toast]);
  
  const handleAddUser = () => {
    // In a real application, you would implement user registration
    // However, Firebase requires direct user interaction for security reasons
    // So this would typically be handled through Firebase Auth UI or similar
    toast({
      title: "Feature Not Available",
      description: "User registration requires Firebase Auth UI integration. Please contact your administrator to add new users.",
    });
    setIsAddUserOpen(false);
  };
  
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-primary">Admin</Badge>;
      case 'manager':
        return <Badge className="bg-blue-500">Manager</Badge>;
      default:
        return <Badge variant="outline">User</Badge>;
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl font-semibold text-gray-900">Users & Permissions</h1>
          <p className="text-sm text-gray-500">Manage user accounts and access permissions</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
            <DialogTrigger asChild>
              <Button className="inline-flex items-center justify-center">
                <UserPlus className="mr-2 h-4 w-4" />
                Add New User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    placeholder="Enter full name"
                    value={newUser.displayName}
                    onChange={(e) => setNewUser({...newUser, displayName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="Enter email address" 
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select 
                    value={newUser.role} 
                    onValueChange={(value) => setNewUser({...newUser, role: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>Cancel</Button>
                <Button onClick={handleAddUser}>Add User</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map(user => (
                  <TableRow key={user.id} className={currentUser?.uid === user.id ? "bg-primary/5" : ""}>
                    <TableCell className="font-medium">{user.displayName || "-"}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>
                      {user.lastLogin ? format(user.lastLogin, "MMM dd, yyyy HH:mm") : "Never"}
                    </TableCell>
                    <TableCell>
                      {currentUser?.uid === user.id ? (
                        <Badge className="bg-green-500">Current</Badge>
                      ) : (
                        <Badge variant="outline">Active</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Permissions Info */}
      <Card>
        <CardHeader className="flex flex-row items-center">
          <Shield className="h-5 w-5 mr-2 text-primary" />
          <CardTitle>Permissions Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-1">Admin</h3>
              <p className="text-sm text-gray-500">Full access to all system features including user management, financial reports, and system settings.</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-1">Manager</h3>
              <p className="text-sm text-gray-500">Access to sales, customers, products, returns, and financial reports. Cannot manage users or system settings.</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-1">User</h3>
              <p className="text-sm text-gray-500">Limited access to sales, customers, and products. Cannot access financial reports or make returns without approval.</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 border-t text-sm text-gray-500">
          Contact your system administrator to request permission changes.
        </CardFooter>
      </Card>
    </div>
  );
}
