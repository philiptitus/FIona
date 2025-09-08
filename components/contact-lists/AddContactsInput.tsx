'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/use-debounce';
import { Search, Loader2, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EmailListEntry } from '@/store/slices/emailSlice';
import { handleFetchEmails } from '@/store/actions/emailActions';
import { useAppDispatch } from '@/store/hooks';
import { addEmailsToContactList } from '@/store/actions/contactListActions';
import { toast } from '@/components/ui/use-toast';

interface AddContactsInputProps {
  listId: number;
  onSuccess?: () => void;
  disabled?: boolean;
  campaignId?: number;
}

const AddContactsInput = ({ listId, onSuccess, disabled = false, campaignId }: AddContactsInputProps) => {
  const dispatch = useAppDispatch();
  const [inputValue, setInputValue] = useState('');
  const [searchResults, setSearchResults] = useState<EmailListEntry[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedEmails, setSelectedEmails] = useState<EmailListEntry[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const debouncedSearchTerm = useDebounce(inputValue, 300);

  // Search for emails when input changes
  useEffect(() => {
    const searchEmails = async () => {
      if (!debouncedSearchTerm || debouncedSearchTerm.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const result = await dispatch(handleFetchEmails({
          search: debouncedSearchTerm,
          campaignId,
        }));
        
        if (Array.isArray(result)) {
          // Filter out already selected emails
          const filteredResults = result.filter(
            (email) => !selectedEmails.some((selected) => selected.id === email.id)
          );
          setSearchResults(filteredResults);
        }
      } catch (error) {
        console.error('Error searching emails:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    searchEmails();
  }, [debouncedSearchTerm, dispatch, campaignId, selectedEmails]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (e.target.value.length > 1) {
      setIsDropdownOpen(true);
    } else {
      setIsDropdownOpen(false);
    }
  };

  const handleSelectEmail = (email: EmailListEntry) => {
    setSelectedEmails((prev) => [...prev, email]);
    setInputValue('');
    setSearchResults([]);
    setIsDropdownOpen(false);
  };

  const handleRemoveEmail = (emailId: number) => {
    setSelectedEmails((prev) => prev.filter((email) => email.id !== emailId));
  };

  const handleAddClick = async () => {
    if (selectedEmails.length === 0) return;

    try {
      setIsLoading(true);
      const emailIds = selectedEmails.map(email => email.id);
      
      await dispatch(addEmailsToContactList({ 
        listId,
        emailIds
      })).unwrap();
      
      toast({
        title: 'Success',
        description: `${selectedEmails.length} contact(s) added to the list`,
        variant: 'default',
      });
      
      setSelectedEmails([]);
      setInputValue('');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error as string || 'Failed to add contacts to the list',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim() && searchResults.length > 0) {
      e.preventDefault();
      handleSelectEmail(searchResults[0]);
    } else if (e.key === 'Backspace' && !inputValue && selectedEmails.length > 0) {
      // Remove last selected email on backspace when input is empty
      setSelectedEmails((prev) => prev.slice(0, -1));
    }
  };

  return (
    <div className="relative">
      <h3 className="text-sm font-medium mb-2">Add Contacts</h3>
      
      {/* Selected emails */}
      {selectedEmails.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedEmails.map((email) => (
            <div 
              key={email.id} 
              className="inline-flex items-center bg-primary/10 text-primary text-sm rounded-full px-3 py-1"
            >
              {email.email}
              <button
                type="button"
                onClick={() => handleRemoveEmail(email.id)}
                className="ml-2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search for contacts..."
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => inputValue.length > 1 && setIsDropdownOpen(true)}
            onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
            className="pl-10 pr-4 py-2 w-full"
            disabled={disabled}
          />
          {isSearching && (
            <Loader2 className="absolute right-3 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>

        {/* Search results dropdown */}
        {isDropdownOpen && searchResults.length > 0 && (
          <div className="absolute z-10 mt-1 w-full rounded-md bg-popover shadow-lg border">
            <div className="max-h-60 overflow-auto">
              {searchResults.map((result) => (
                <div
                  key={result.id}
                  className="px-4 py-2 text-sm cursor-pointer hover:bg-accent flex items-center justify-between"
                  onMouseDown={() => handleSelectEmail(result)}
                >
                  <div>
                    <div className="font-medium">
                      {result.first_name} {result.last_name}
                    </div>
                    <div className="text-muted-foreground">{result.email}</div>
                    {result.organization_name && (
                      <div className="text-xs text-muted-foreground">
                        {result.organization_name}
                      </div>
                    )}
                  </div>
                  <Check className="h-4 w-4 text-primary" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-end">
        <Button 
          onClick={handleAddClick}
          disabled={selectedEmails.length === 0 || disabled}
          className="w-full sm:w-auto"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding...
            </>
          ) : (
            `Add ${selectedEmails.length > 0 ? `(${selectedEmails.length}) ` : ''}Contacts`
          )}
        </Button>
      </div>
      
      <p className="text-xs text-muted-foreground mt-2">
        Start typing to search for contacts. Select from the dropdown to add them.
      </p>
    </div>
  );
};

export default AddContactsInput;
