import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import api from '../api/config';
import Navbar from './Navbar';
import DashboardHome from './DashboardHome';
import ExpiringDocuments from './ExpiringDocuments';
import UsersManagement from './UsersManagement';
import EmployeeManagement from './EmployeeManagement';
import BranchesManagement from './BranchesManagement';
import BranchManagement from './BranchManagement';
import ViewEmployee from './ViewEmployee';
import ViewBranch from './ViewBranch';
import VehiclesManagement from './VehiclesManagement';
import VacationManagement from './VacationManagement';
import TempEmployeeManagement from './TempEmployeeManagement';
import AddTempEmployee from './AddTempEmployee';
import AccountingManagement from './AccountingManagement';
import ManagerDashboard from './ManagerDashboard';
import ActivityLog from './ActivityLog';
import AddUser from './AddUser';
import EditUser from './EditUser';
import AddBranch from './AddBranch';
import EditBranchComplete from './EditBranchComplete';
import EditVehicle from './EditVehicle';
import Modal from './Modal';
import WideModal from './WideModal';

// Create mock data for initial state
const mockEmployees = [
  {
    _id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Manager',
    branch: 'Main Branch',
    designation: 'Senior Manager',
    doj: '2022-01-15T00:00:00.000Z',
    qid: 'QID123456',
    passportNumber: 'P123456',
    workLocation: 'Doha',
    status: 'Working'
  },
  {
    _id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'Employee',
    branch: 'Main Branch',
    designation: 'Developer',
    doj: '2022-03-10T00:00:00.000Z',
    qid: 'QID789012',
    passportNumber: 'P789012',
    workLocation: 'Doha',
    status: 'Working'
  }
];

// Create mock branches data
const mockBranches = [
  {
    _id: '1',
    name: 'Main Branch',
    location: 'Doha',
    manager: 'John Doe',
    contact: '+974 1234 5678',
    assignedUsers: ['1'],
    documents: [],
    vehicles: []
  },
  {
    _id: '2',
    name: 'Secondary Branch',
    location: 'Al Wakrah',
    manager: 'Ahmed Ali',
    contact: '+974 8765 4321',
    assignedUsers: ['2'],
    documents: [],
    vehicles: []
  }
];

export default function Dashboard({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || location.state?.tab || 'dashboard');
  
  // Update activeTab when URL changes
  useEffect(() => {
    const tab = searchParams.get('tab') || 'dashboard';
    setActiveTab(tab);
  }, [searchParams]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [showAddBranch, setShowAddBranch] = useState(false);
  const [showEditBranch, setShowEditBranch] = useState(false);
  const [showEditVehicle, setShowEditVehicle] = useState(false);
  const [showViewEmployee, setShowViewEmployee] = useState(false);
  const [showViewBranch, setShowViewBranch] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [viewEmployee, setViewEmployee] = useState(null);
  const [viewBranch, setViewBranch] = useState(null);
  const [users, setUsers] = useState(mockEmployees);
  const [employees, setEmployees] = useState(mockEmployees);
  const [branches, setBranches] = useState(mockBranches);
  const [tempEmployees, setTempEmployees] = useState([]);
  const [expenditures, setExpenditures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Set up axios defaults
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Token will be automatically added to future requests by the api interceptor
    }
  }, []);
  
  // Fetch data on component mount - optimized
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all data in parallel
        const [branchesResponse, employeesResponse, tempEmployeesResponse, expendituresResponse] = await Promise.all([
          api.get('/api/branches').catch(() => ({ data: [] })),
          api.get('/api/employees').catch(() => ({ data: [] })),
          api.get('/api/temp-employees').catch(() => ({ data: [] })),
          api.get('/api/expenditures').catch(() => ({ data: [] }))
        ]);
        
        if (branchesResponse.data?.length > 0) {
          setBranches(branchesResponse.data);
        }
        
        if (employeesResponse.data?.length > 0) {
          setEmployees(employeesResponse.data);
          setUsers(employeesResponse.data);
        }
        
        if (tempEmployeesResponse.data?.length > 0) {
          setTempEmployees(tempEmployeesResponse.data);
        }
        
        if (expendituresResponse.data?.length > 0) {
          setExpenditures(expendituresResponse.data);
        }
        
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleLogout = () => {
    // Clear auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Token will be removed from localStorage (api interceptor handles headers)
    
    onLogout();
    navigate('/login');
  };

  const handleAddUser = (userData) => {
    // Generate a unique ID for the new employee
    const newId = Date.now().toString();
    
    // Format date fields properly
    const formattedData = {
      _id: newId,
      ...userData,
      doj: userData.doj ? new Date(userData.doj).toISOString() : new Date().toISOString(),
      doe: userData.doe ? new Date(userData.doe).toISOString() : undefined,
      medicalCardExpiry: userData.medicalCardExpiry ? new Date(userData.medicalCardExpiry).toISOString() : undefined,
      visaExpiry: userData.visaExpiry ? new Date(userData.visaExpiry).toISOString() : undefined
    };
    
    // Add to local state
    setEmployees([...employees, formattedData]);
    setUsers([...users, formattedData]);
    
    // Try to add to API
    const addData = async () => {
      try {
        console.log('Adding employee:', userData);
        const response = await api.post('/api/employees', userData);
        console.log('Add employee response:', response.data);
      } catch (err) {
        console.error('Error adding employee to API:', err);
        // Continue with local data
      }
    };
    
    addData();
    alert('Employee added successfully!');
  };
  
  const handleViewUser = (user) => {
    setViewEmployee(user);
    setShowViewEmployee(true);
  };
  
  const handleViewBranch = (branch) => {
    setViewBranch(branch);
    setShowViewBranch(true);
  };
  
  const handleEditUser = (userId) => {
    const user = users.find(u => u._id === userId);
    if (user) {
      setSelectedUser(user);
      setShowEditUser(true);
    }
  };
  
  const handleUpdateUser = (updatedUser) => {
    // Update local state
    setEmployees(employees.map(employee => 
      employee._id === updatedUser._id ? updatedUser : employee
    ));
    
    setUsers(users.map(user => 
      user._id === updatedUser._id ? updatedUser : user
    ));
    
    // Try to update in API
    const updateData = async () => {
      try {
        console.log('Updating employee:', updatedUser);
        await api.put(`/api/employees/${updatedUser._id}`, updatedUser);
      } catch (err) {
        console.error('Error updating employee in API:', err);
        // Continue with local data
      }
    };
    
    updateData();
    alert('Employee updated successfully!');
  };
  
  const handleDeleteUser = async (userId) => {
    // Update local state
    setEmployees(employees.filter(employee => employee._id !== userId));
    setUsers(users.filter(user => user._id !== userId));
    
    // Try to delete from API
    try {
      console.log('Deleting employee:', userId);
      await api.delete(`/api/employees/${userId}`);
    } catch (err) {
      console.error('Error deleting employee from API:', err);
      // Continue with local data
    }
    
    alert('Employee deleted successfully!');
  };

  const handleAddBranch = async (branchData) => {
    try {
      console.log('Adding branch with data:', branchData);
      
      // Format vehicles data properly and ensure all document fields are included
      const formattedData = {
        ...branchData,
        // Ensure all document expiry fields are included
        crNumber: branchData.crNumber || '',
        crExpiry: branchData.crExpiry || null,
        ruksaNumber: branchData.ruksaNumber || '',
        ruksaExpiry: branchData.ruksaExpiry || null,
        computerCardNumber: branchData.computerCardNumber || '',
        computerCardExpiry: branchData.computerCardExpiry || null,
        certificationNumber: branchData.certificationNumber || '',
        certificationExpiry: branchData.certificationExpiry || null,
        branchDocuments: branchData.branchDocuments || {},
        vehicles: branchData.vehicles.map(vehicle => ({
          type: vehicle.type,
          licenseNumber: vehicle.licenseNumber,
          licenseExpiry: vehicle.licenseExpiry,
          insuranceExpiry: vehicle.insuranceExpiry,
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          color: vehicle.color,
          status: vehicle.status || 'active'
        }))
      };
      
      // Call API to add branch
      const response = await api.post('/api/branches', formattedData);
      console.log('Branch added response:', response.data);
      
      // Get the newly created branch from the response
      const newBranch = response.data;
      
      // Update local state
      setBranches([...branches, newBranch]);
      
      alert('Branch added successfully!');
    } catch (error) {
      console.error('Error adding branch:', error);
      
      // Generate a unique ID for the new branch for local state
      const newId = Date.now().toString();
      const newBranch = { 
        _id: newId, 
        ...branchData
      };
      
      // Add to local state anyway
      setBranches([...branches, newBranch]);
      
      alert(`Branch added to local state, but failed to save to server: ${error.message}`);
    }
  };
  
  const handleEditBranch = (branchId) => {
    console.log('Editing branch with ID:', branchId);
    const branch = branches.find(b => b._id === branchId);
    if (branch) {
      console.log('Found branch to edit:', branch);
      setSelectedBranch({...branch}); // Create a copy to avoid reference issues
      setShowEditBranch(true);
    } else {
      console.error('Branch not found with ID:', branchId);
    }
  };
  
  const handleUpdateBranch = async (updatedBranch) => {
    try {
      console.log('Updating branch with ID:', updatedBranch._id);
      console.log('Update data:', updatedBranch);
      console.log('Branch documents being sent:', updatedBranch.branchDocuments);
      
      // Call API to update branch with all fields
      const response = await api.put(
        `/api/branches/${updatedBranch._id}`, 
        {
          name: updatedBranch.name,
          location: updatedBranch.location,
          address: updatedBranch.address,
          manager: updatedBranch.manager,
          contactNumber: updatedBranch.contactNumber,
          email: updatedBranch.email,
          crNumber: updatedBranch.crNumber || '',
          crExpiry: updatedBranch.crExpiry || null,
          ruksaNumber: updatedBranch.ruksaNumber || '',
          ruksaExpiry: updatedBranch.ruksaExpiry || null,
          computerCardNumber: updatedBranch.computerCardNumber || '',
          computerCardExpiry: updatedBranch.computerCardExpiry || null,
          certificationNumber: updatedBranch.certificationNumber || '',
          certificationExpiry: updatedBranch.certificationExpiry || null,
          branchDocuments: updatedBranch.branchDocuments || {},
          documents: updatedBranch.documents,
          vehicles: updatedBranch.vehicles,
          assignedUsers: updatedBranch.assignedUsers
        }
      );
      
      console.log('Branch update response:', response.data);
      
      // Update local state
      setBranches(branches.map(branch => 
        branch._id === updatedBranch._id ? updatedBranch : branch
      ));
      
      alert('Branch updated successfully!');
    } catch (error) {
      console.error('Error updating branch:', error);
      alert(`Failed to update branch: ${error.message}. Please try again.`);
    }
  };
  
  const handleEditVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowEditVehicle(true);
  };
  
  const handleUpdateVehicle = async (updatedVehicle) => {
    try {
      console.log('Updating vehicle:', updatedVehicle);
      
      // Format the data for the API
      const apiData = {
        branch: updatedVehicle.branch || updatedVehicle.branchId, // Support both formats
        type: updatedVehicle.type || '',
        licenseNumber: updatedVehicle.licenseNumber,
        licenseExpiry: updatedVehicle.licenseExpiry,
        insuranceExpiry: updatedVehicle.insuranceExpiry,
        make: updatedVehicle.make || '',
        model: updatedVehicle.model || '',
        year: updatedVehicle.year || 2025,
        color: updatedVehicle.color || '',
        status: updatedVehicle.status || 'active',
        licenseDocument: updatedVehicle.licenseDocument || null,
        insuranceDocument: updatedVehicle.insuranceDocument || null
      };
      
      console.log('Sending vehicle update data:', apiData);
      
      // Call API to update vehicle
      const response = await api.put(
        `/api/vehicles/${updatedVehicle.licenseNumber}`, 
        apiData
      );
      
      console.log('Vehicle update response:', response.data);
      
      // Update local state
      const updatedBranches = branches.map(branch => {
        if (branch._id === updatedVehicle.branchId) {
          // If the vehicle was moved to a different branch
          if (updatedVehicle.branchId !== updatedVehicle.originalBranchId) {
            // Remove from original branch and add to new branch
            return {
              ...branch,
              vehicles: [...(branch.vehicles || []), {
                type: updatedVehicle.type,
                licenseNumber: updatedVehicle.licenseNumber,
                licenseExpiry: updatedVehicle.licenseExpiry,
                insuranceExpiry: updatedVehicle.insuranceExpiry,
                make: updatedVehicle.make,
                model: updatedVehicle.model,
                year: updatedVehicle.year,
                color: updatedVehicle.color,
                status: updatedVehicle.status,
                licenseDocument: updatedVehicle.licenseDocument,
                insuranceDocument: updatedVehicle.insuranceDocument
              }]
            };
          } else {
            // Update in the same branch
            return {
              ...branch,
              vehicles: (branch.vehicles || []).map(vehicle => 
                vehicle.licenseNumber === updatedVehicle.licenseNumber ? {
                  type: updatedVehicle.type,
                  licenseNumber: updatedVehicle.licenseNumber,
                  licenseExpiry: updatedVehicle.licenseExpiry,
                  insuranceExpiry: updatedVehicle.insuranceExpiry,
                  make: updatedVehicle.make,
                  model: updatedVehicle.model,
                  year: updatedVehicle.year,
                  color: updatedVehicle.color,
                  status: updatedVehicle.status,
                  licenseDocument: updatedVehicle.licenseDocument,
                  insuranceDocument: updatedVehicle.insuranceDocument
                } : vehicle
              )
            };
          }
        } else if (branch._id === updatedVehicle.originalBranchId && updatedVehicle.branchId !== updatedVehicle.originalBranchId) {
          // Remove from original branch if moved
          return {
            ...branch,
            vehicles: (branch.vehicles || []).filter(vehicle => 
              vehicle.licenseNumber !== updatedVehicle.licenseNumber
            )
          };
        }
        return branch;
      });
      
      setBranches(updatedBranches);
      alert('Vehicle updated successfully!');
    } catch (error) {
      console.error('Error updating vehicle:', error);
      alert('Failed to update vehicle. Please try again.');
    }
  };
  
  // Handle adding a new vehicle
  const handleAddVehicle = async (vehicleData) => {
    try {
      console.log('Adding vehicle with data:', vehicleData);
      
      // Format the data for the API
      const apiData = {
        branch: vehicleData.branch || vehicleData.branchId,
        type: vehicleData.type || '',
        istimara: vehicleData.istimara || '',
        licenseNumber: vehicleData.licenseNumber || vehicleData.istimara,
        licenseExpiry: vehicleData.licenseExpiry || null,
        insuranceExpiry: vehicleData.insuranceExpiry || null,
        make: vehicleData.make || '',
        model: vehicleData.model || '',
        year: vehicleData.year ? parseInt(vehicleData.year) : null,
        color: vehicleData.color || '',
        status: vehicleData.status || 'active',
        istimaraDocument: vehicleData.istimaraDocument || null,
        licenseDocument: vehicleData.licenseDocument || null,
        insuranceDocument: vehicleData.insuranceDocument || null,
        vehicleImage: vehicleData.vehicleImage || null
      };
      
      console.log('Sending API data:', apiData);
      
      // Call the API to add the vehicle
      const response = await api.post('/api/vehicles', apiData);
      console.log('Vehicle added response:', response.data);
      
      // Get the newly created vehicle from the response
      const newVehicle = response.data.data;
      
      // Update the local state by adding the vehicle to the appropriate branch
      const updatedBranches = branches.map(branch => {
        if (branch._id === vehicleData.branchId) {
          return {
            ...branch,
            vehicles: [...(branch.vehicles || []), {
              ...newVehicle,
              branchId: branch._id,
              branchName: branch.name
            }]
          };
        }
        return branch;
      });
      
      setBranches(updatedBranches);
      alert('Vehicle added successfully!');
    } catch (error) {
      console.error('Error adding vehicle:', error);
      alert(`Failed to add vehicle: ${error.response?.data?.message || error.message}. Please try again.`);
    }
  };
  
  // Handle adding temporary employee
  const handleAddTempEmployee = async (tempEmployeeData) => {
    try {
      const response = await api.post('/api/temp-employees', tempEmployeeData);
      const newTempEmployee = response.data;
      setTempEmployees([...tempEmployees, newTempEmployee]);
      alert('Temporary employee added successfully!');
    } catch (error) {
      console.error('Error adding temporary employee:', error);
      alert('Failed to add temporary employee. Please try again.');
    }
  };

  // Handle editing temporary employee
  const handleEditTempEmployee = async (tempEmployeeData) => {
    try {
      const response = await api.put(`/api/temp-employees/${tempEmployeeData._id}`, tempEmployeeData);
      const updatedTempEmployee = response.data;
      setTempEmployees(tempEmployees.map(emp => 
        emp._id === tempEmployeeData._id ? updatedTempEmployee : emp
      ));
      alert('Temporary employee updated successfully!');
    } catch (error) {
      console.error('Error updating temporary employee:', error);
      alert('Failed to update temporary employee. Please try again.');
    }
  };

  // Handle adding expenditure
  const handleAddExpenditure = async (expenditureData) => {
    try {
      const response = await api.post('/api/expenditures', expenditureData);
      const newExpenditure = response.data;
      setExpenditures([...expenditures, newExpenditure]);
      alert('Daily expenditure added successfully!');
    } catch (error) {
      console.error('Error adding expenditure:', error);
      alert('Failed to add expenditure. Please try again.');
    }
  };

  // Handle editing expenditure
  const handleEditExpenditure = async (expenditureData) => {
    try {
      const response = await api.put(`/api/expenditures/${expenditureData._id}`, expenditureData);
      const updatedExpenditure = response.data;
      setExpenditures(expenditures.map(exp => 
        exp._id === expenditureData._id ? updatedExpenditure : exp
      ));
      alert('Expenditure updated successfully!');
    } catch (error) {
      console.error('Error updating expenditure:', error);
      alert('Failed to update expenditure. Please try again.');
    }
  };

  // Handle deleting expenditure
  const handleDeleteExpenditure = async (expenditureId) => {
    try {
      await api.delete(`/api/expenditures/${expenditureId}`);
      setExpenditures(expenditures.filter(exp => exp._id !== expenditureId));
      alert('Expenditure deleted successfully!');
    } catch (error) {
      console.error('Error deleting expenditure:', error);
      alert('Failed to delete expenditure. Please try again.');
    }
  };

  // Handle deleting temporary employee
  const handleDeleteTempEmployee = async (tempEmployeeId) => {
    if (window.confirm('Are you sure you want to delete this temporary employee?')) {
      try {
        await api.delete(`/api/temp-employees/${tempEmployeeId}`);
        setTempEmployees(tempEmployees.filter(emp => emp._id !== tempEmployeeId));
        alert('Temporary employee deleted successfully!');
      } catch (error) {
        console.error('Error deleting temporary employee:', error);
        alert('Failed to delete temporary employee. Please try again.');
      }
    }
  };

  // Handle deleting a vehicle
  const handleDeleteVehicle = async (licenseNumber, branchId) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        console.log(`Deleting vehicle with license number: ${licenseNumber} from branch: ${branchId}`);
        
        // Find the branch and remove the vehicle from its vehicles array
        const branch = branches.find(b => b._id === branchId);
        if (!branch) {
          alert('Branch not found');
          return;
        }
        
        // Create updated vehicles array without the deleted vehicle
        const updatedVehicles = (branch.vehicles || []).filter(v => v.licenseNumber !== licenseNumber);
        
        // Update the branch with the new vehicles array
        const updatedBranchData = {
          ...branch,
          vehicles: updatedVehicles
        };
        
        // Call the API to update the branch
        const response = await api.put(`/api/branches/${branchId}`, updatedBranchData);
        console.log('Delete response:', response.data);
        
        // Update the local state
        const updatedBranches = branches.map(b => {
          if (b._id === branchId) {
            return {
              ...b,
              vehicles: updatedVehicles
            };
          }
          return b;
        });
        
        setBranches(updatedBranches);
        alert('Vehicle deleted successfully!');
      } catch (error) {
        console.error('Error deleting vehicle:', error);
        alert(`Failed to delete vehicle: ${error.response?.data?.message || error.message}. Please try again.`);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-3 text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  // Get current user from localStorage
  const getCurrentUser = () => {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  };

  const currentUser = getCurrentUser();
  const isManager = currentUser?.role === 'manager' || currentUser?.role === 'Manager';
  
  console.log('Current User:', currentUser);
  console.log('Is Manager:', isManager);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar Component */}
      <Navbar onLogout={handleLogout} />

      {/* Main content */}
      <div className="flex py-4 sm:py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Show manager dashboard for managers, regular dashboard for others */}
          {isManager ? (
            <ManagerDashboard 
              expenditures={expenditures}
              onAddExpenditure={handleAddExpenditure}
              branches={branches}
              currentUser={currentUser}
            />
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardHome users={users} branches={branches} tempEmployees={tempEmployees} expenditures={expenditures} setActiveTab={setActiveTab} />
              )}
            </>
          )}

              {/* Admin-only sections */}
              {activeTab === 'users' && (
                <EmployeeManagement 
                  users={users} 
                  onViewUser={handleViewUser}
                  onEditUser={handleEditUser}
                  onDeleteUser={handleDeleteUser}
                  onAddUser={() => setShowAddUser(true)}
                />
              )}

              {activeTab === 'branches' && (
                <BranchManagement 
                  branches={branches} 
                  users={users} 
                  onEditBranch={handleEditBranch}
                  onViewBranch={handleViewBranch}
                  onAddBranch={() => setShowAddBranch(true)}
                />
              )}

              {activeTab === 'vehicles' && (
                <VehiclesManagement 
                  branches={branches}
                  onEditVehicle={handleEditVehicle}
                  onAddVehicle={handleAddVehicle}
                  onDeleteVehicle={handleDeleteVehicle}
                />
              )}

              {activeTab === 'temp-employees' && (
                <TempEmployeeManagement 
                  tempEmployees={tempEmployees}
                  onAddTempEmployee={handleAddTempEmployee}
                  onEditTempEmployee={handleEditTempEmployee}
                  onDeleteTempEmployee={handleDeleteTempEmployee}
                  branches={branches}
                />
              )}

              {activeTab === 'accounting' && (
                <AccountingManagement 
                  expenditures={expenditures}
                  onAddExpenditure={handleAddExpenditure}
                  onEditExpenditure={handleEditExpenditure}
                  onDeleteExpenditure={handleDeleteExpenditure}
                  branches={branches}
                  users={users}
                  tempEmployees={tempEmployees}
                />
              )}

              {activeTab === 'activities' && (
                <ActivityLog />
              )}

              {activeTab === 'vacations' && (
                <VacationManagement users={users} />
              )}

              {activeTab === 'expiring-documents' && (
                <ExpiringDocuments users={users} branches={branches} onEditUser={handleEditUser} onEditBranch={handleEditBranch} onEditVehicle={handleEditVehicle} />
              )}


        </div>
      </div>

      {/* Modals */}
      <WideModal isOpen={showAddUser} onClose={() => setShowAddUser(false)}>
        <AddUser 
          onClose={() => setShowAddUser(false)} 
          onAddUser={handleAddUser} 
        />
      </WideModal>
      
      <WideModal isOpen={showEditUser} onClose={() => setShowEditUser(false)}>
        <EditUser 
          user={selectedUser}
          onClose={() => setShowEditUser(false)} 
          onUpdateUser={handleUpdateUser}
        />
      </WideModal>

      <WideModal isOpen={showAddBranch} onClose={() => setShowAddBranch(false)}>
        <AddBranch 
          onClose={() => setShowAddBranch(false)} 
          onAddBranch={handleAddBranch}
          users={users}
        />
      </WideModal>

      <WideModal isOpen={showEditBranch} onClose={() => setShowEditBranch(false)}>
        <EditBranchComplete 
          branch={selectedBranch}
          onClose={() => setShowEditBranch(false)} 
          onUpdateBranch={handleUpdateBranch}
          users={users}
        />
      </WideModal>

      <WideModal isOpen={showEditVehicle} onClose={() => setShowEditVehicle(false)}>
        <EditVehicle 
          vehicle={{...selectedVehicle, originalBranchId: selectedVehicle?.branchId}}
          onClose={() => setShowEditVehicle(false)} 
          onUpdateVehicle={handleUpdateVehicle}
          branches={branches}
        />
      </WideModal>

      <WideModal isOpen={showViewEmployee} onClose={() => setShowViewEmployee(false)}>
        <ViewEmployee 
          employee={viewEmployee}
          onClose={() => setShowViewEmployee(false)}
        />
      </WideModal>

      <WideModal isOpen={showViewBranch} onClose={() => setShowViewBranch(false)}>
        <ViewBranch 
          branch={viewBranch}
          users={users}
          onClose={() => setShowViewBranch(false)}
        />
      </WideModal>
    </div>
  );
}