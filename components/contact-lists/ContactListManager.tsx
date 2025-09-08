'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { 
  fetchContactLists, 
  createContactList, 
  updateContactList, 
  deleteContactList,
  addEmailsToContactList,
  removeEmailsFromContactList,
  resetContactListState,
  fetchContactListDetails
} from '@/store/actions/contactListActions';
import { Email } from '@/store/slices/contactListSlice';
import { Plus, Trash2, Edit, Mail, Users, Loader2, Check, X, ChevronDown } from 'lucide-react';
import AddContactsInput from './AddContactsInput';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

const ContactListManager = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { lists, currentList, isLoading, error } = useSelector((state: RootState) => state.contactList);
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedList, setSelectedList] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const [activeTab, setActiveTab] = useState('lists');

  // Fetch contact lists on component mount
  useEffect(() => {
    dispatch(fetchContactLists());
    
    return () => {
      dispatch(resetContactListState());
    };
  }, [dispatch]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle create/update contact list
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedList) {
        await dispatch(updateContactList({ 
          listId: selectedList, 
          data: formData 
        })).unwrap();
        toast({
          title: 'Success',
          description: 'Contact list updated successfully',
          variant: 'default',
        });
      } else {
        await dispatch(createContactList(formData)).unwrap();
        toast({
          title: 'Success',
          description: 'Contact list created successfully',
          variant: 'default',
        });
      }
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: 'Error',
        description: error as string,
        variant: 'destructive',
      });
    }
  };

  // Handle delete contact list
  const handleDelete = async () => {
    if (!selectedList) return;
    
    try {
      await dispatch(deleteContactList(selectedList)).unwrap();
      toast({
        title: 'Success',
        description: 'Contact list deleted successfully',
        variant: 'default',
      });
      setIsDeleteDialogOpen(false);
      setSelectedList(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: error as string,
        variant: 'destructive',
      });
    }
  };



  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
    });
    setSelectedList(null);
    setEmailInput('');
  };

  // Open edit dialog with list data
  const openEditDialog = (list: any) => {
    setFormData({
      name: list.name,
      description: list.description || '',
    });
    setSelectedList(list.id);
    setIsCreateDialogOpen(true);
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (listId: number) => {
    setSelectedList(listId);
    setIsDeleteDialogOpen(true);
  };

  // Handle list selection
  const handleListClick = async (listId: number) => {
    const newSelectedList = selectedList === listId ? null : listId;
    setSelectedList(newSelectedList);
    
    if (newSelectedList) {
      try {
        console.log("List selected");
        await dispatch(fetchContactListDetails(newSelectedList));
      } catch (error) {
        console.error('Error fetching contact list details:', error);
      }
    }
  };



  // Get current list details
  const currentListDetails = lists.find(list => list.id === selectedList);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Contact Lists</h2>
          <p className="text-muted-foreground">
            Organize your contacts into lists for better campaign targeting
          </p>
        </div>
        <Button onClick={() => { 
          resetForm();
          setIsCreateDialogOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" /> Create List
        </Button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar - Lists */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Your Lists</CardTitle>
            <CardDescription>Select a list to view or edit</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && lists.length === 0 ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-md" />
                ))}
              </div>
            ) : error ? (
              <div className="text-destructive text-sm">{error}</div>
            ) : lists.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Users className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p>No contact lists found</p>
                <p className="text-sm">Create your first list to get started</p>
              </div>
            ) : (
              <div className="space-y-2">
                {lists.map((list) => (
                  <div 
                    key={list.id}
                    onClick={() => handleListClick(list.id)}
                    className={`flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors ${
                      selectedList === list.id 
                        ? 'bg-primary/10 border border-primary/20' 
                        : 'hover:bg-accent/50'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{list.name}</p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Mail className="h-3 w-3 mr-1" />
                        <span>{list.email_count} contacts</span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(list)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteDialog(list.id);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Panel - List Details */}
        <div className="lg:col-span-2 space-y-6">
          {selectedList ? (
            <>
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{currentListDetails?.name || 'Loading...'}</CardTitle>
                      {currentListDetails?.description && (
                        <CardDescription>{currentListDetails.description}</CardDescription>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openEditDialog(currentListDetails!)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-destructive hover:text-destructive"
                        onClick={() => openDeleteDialog(selectedList)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-6 w-3/4" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium mb-2">List Details</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Created</p>
                            <p>{new Date(currentListDetails?.created_at || '').toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Last Updated</p>
                            <p>{new Date(currentListDetails?.updated_at || '').toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Total Contacts</p>
                            <p>{currentListDetails?.email_count || 0}</p>
                          </div>
                        </div>
                      </div>

                      <AddContactsInput 
                        listId={selectedList}
                        disabled={!selectedList}
                        onSuccess={() => {
                          // Refresh both the lists and the current list details after adding emails
                          if (selectedList) {
                            dispatch(fetchContactLists());
                            dispatch(fetchContactListDetails(selectedList));
                          }
                        }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Contacts</CardTitle>
                  <CardDescription>
                    {currentListDetails?.email_count || 0} contacts in this list
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-10 w-full" />
                      ))}
                    </div>
                  ) : currentListDetails?.emails?.length ? (
                    <ScrollArea className="h-[300px] pr-4">
                      <div className="space-y-2">
                        {currentListDetails.emails.map((email: Email) => (
                          <div 
                            key={email.id} 
                            className="flex items-center justify-between p-3 rounded-md border"
                          >
                            <div>
                              <p className="font-medium">{email.email}</p>
                              {email.first_name && (
                                <p className="text-sm text-muted-foreground">
                                  {email.first_name} {email.last_name || ''}
                                </p>
                              )}
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => {
                                // Handle remove email from list
                                dispatch(removeEmailsFromContactList({
                                  listId: selectedList,
                                  emailIds: [email.id]
                                }));
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Mail className="mx-auto h-8 w-8 mb-2 opacity-50" />
                      <p>No contacts in this list</p>
                      <p className="text-sm">Add some emails using the field above</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="py-12 text-center">
                <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-1">No list selected</h3>
                <p className="text-muted-foreground mb-4">
                  Select a list from the sidebar or create a new one to get started
                </p>
                <Button onClick={() => {
                  resetForm();
                  setIsCreateDialogOpen(true);
                }}>
                  <Plus className="mr-2 h-4 w-4" /> Create List
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Create/Edit List Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedList ? 'Edit Contact List' : 'Create New Contact List'}
            </DialogTitle>
            <DialogDescription>
              {selectedList 
                ? 'Update the details of your contact list.'
                : 'Create a new contact list to organize your emails.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  List Name <span className="text-destructive">*</span>
                </label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., VIP Customers, Newsletter Subscribers"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description (Optional)
                </label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="What's this list for?"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {selectedList ? 'Update List' : 'Create List'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Contact List</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this contact list? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete List'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContactListManager;
