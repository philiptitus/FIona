# Frontend Implementation Guide for Neuron System

## API Endpoints

### 1. Create Neuron
```
POST /mail/neuron/create/
Authorization: Bearer <token>
Content-Type: application/json

{
  "workflow": 1,
  "campaign_type": "Product Launch",
  "content_preference": "both",
  "recipient_type": "email",
  "generate_email_lists": true,
  "allow_sequence": false,
  "copies": 1,
  "selected_dynamic_variables": ["first_name", "company_name"],
  "selected_links": ["linkedin", "personal_website"],
  "scheduled_time": "09:00:00",
  "max_daily_campaigns": 3
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "workflow": 1,
  "workflow_name": "Sales Outreach",
  "campaign_type": "Product Launch",
  "content_preference": "both",
  "recipient_type": "email",
  "generate_email_lists": true,
  "allow_sequence": false,
  "copies": 1,
  "selected_dynamic_variables": ["first_name", "company_name"],
  "selected_links": ["linkedin", "personal_website"],
  "scheduled_time": "09:00:00",
  "max_daily_campaigns": 3,
  "is_active": true,
  "last_run_date": null,
  "daily_campaign_count": 0,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

**Error Response (400 Bad Request):**
```json
{
  "workflow": ["Selected workflow contains placeholders {{}}. Please choose a workflow without placeholders."]
}
```

### 2. Get Neuron Details
```
GET /mail/neuron/
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "id": 1,
  "workflow": 1,
  "workflow_name": "Sales Outreach",
  "campaign_type": "Product Launch",
  "content_preference": "both",
  "recipient_type": "email",
  "generate_email_lists": true,
  "allow_sequence": false,
  "copies": 1,
  "selected_dynamic_variables": ["first_name", "company_name"],
  "selected_links": ["linkedin", "personal_website"],
  "scheduled_time": "09:00:00",
  "max_daily_campaigns": 3,
  "is_active": true,
  "last_run_date": "2024-01-15",
  "daily_campaign_count": 2,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T15:45:00Z"
}
```

### 3. Update Neuron
```
PUT /mail/neuron/
Authorization: Bearer <token>
Content-Type: application/json

{
  "workflow": 2,
  "scheduled_time": "14:00:00",
  "max_daily_campaigns": 5,
  "is_active": true
}
```

### 4. Toggle Neuron Active Status
```
POST /mail/neuron/toggle/
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "is_active": false,
  "message": "Neuron deactivated"
}
```

### 5. Get Execution History
```
GET /mail/neuron/executions/
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "campaign": 15,
    "campaign_name": "Auto: Sales Outreach - 2024-01-15 09:00",
    "status": "completed",
    "error_message": null,
    "executed_at": "2024-01-15T09:00:00Z",
    "completed_at": "2024-01-15T09:02:30Z"
  },
  {
    "id": 2,
    "campaign": null,
    "campaign_name": null,
    "status": "failed",
    "error_message": "Workflow contains placeholders",
    "executed_at": "2024-01-15T14:00:00Z",
    "completed_at": "2024-01-15T14:00:05Z"
  }
]
```

### 6. Delete Neuron
```
DELETE /mail/neuron/
Authorization: Bearer <token>
```

**Response (204 No Content)**

## Frontend Implementation Examples

### React Component Structure
```jsx
// NeuronDashboard.jsx
const NeuronDashboard = () => {
  const [neuron, setNeuron] = useState(null);
  const [executions, setExecutions] = useState([]);
  const [workflows, setWorkflows] = useState([]);

  const createNeuron = async (data) => {
    try {
      const response = await api.post('/neuron/create/', data);
      setNeuron(response.data);
      showSuccess('Neuron created successfully!');
    } catch (error) {
      if (error.response?.data?.workflow) {
        showError('Selected workflow contains placeholders. Please choose a different workflow.');
      }
    }
  };

  const toggleNeuron = async () => {
    const response = await api.post('/neuron/toggle/');
    setNeuron(prev => ({ ...prev, is_active: response.data.is_active }));
    showSuccess(response.data.message);
  };

  return (
    <div className="neuron-dashboard">
      {neuron ? (
        <NeuronDetails neuron={neuron} onToggle={toggleNeuron} />
      ) : (
        <NeuronCreateForm onSubmit={createNeuron} workflows={workflows} />
      )}
      <ExecutionHistory executions={executions} />
    </div>
  );
};
```

### Form Validation
```jsx
const validateNeuronForm = (data) => {
  const errors = {};
  
  if (!data.workflow) {
    errors.workflow = 'Please select a workflow';
  }
  
  if (!data.campaign_type?.trim()) {
    errors.campaign_type = 'Campaign type is required';
  }
  
  if (data.copies < 1 || data.copies > 10) {
    errors.copies = 'Copies must be between 1 and 10';
  }
  
  if (data.max_daily_campaigns < 1 || data.max_daily_campaigns > 10) {
    errors.max_daily_campaigns = 'Max daily campaigns must be between 1 and 10';
  }
  
  return errors;
};
```

### Status Indicators
```jsx
const NeuronStatus = ({ neuron }) => {
  const getStatusColor = () => {
    if (!neuron.is_active) return 'gray';
    if (neuron.daily_campaign_count >= neuron.max_daily_campaigns) return 'orange';
    return 'green';
  };

  return (
    <div className={`status-indicator ${getStatusColor()}`}>
      <span className="status-dot"></span>
      {neuron.is_active ? 'Active' : 'Inactive'}
      {neuron.is_active && (
        <span className="daily-count">
          {neuron.daily_campaign_count}/{neuron.max_daily_campaigns} today
        </span>
      )}
    </div>
  );
};
```

## Cron Endpoint (External Service)

### External Cron Service Setup
```
URL: POST https://yourapp.com/mail/cron/process-neurons/?token=YOUR_CRON_API_TOKEN
Method: POST
Schedule: Every minute (* * * * *)
```

**Response:**
```json
{
  "status": "success",
  "timestamp": "2024-01-15T09:00:00Z",
  "neurons": {
    "processed": 3,
    "success_count": 2,
    "failure_count": 1
  }
}
```