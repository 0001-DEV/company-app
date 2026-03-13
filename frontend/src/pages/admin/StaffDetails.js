import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

const StaffDetails = () => {
  const { id } = useParams();
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStaff = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`http://localhost:5000/api/admin/staff/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Failed to fetch staff');

        const data = await res.json();
        console.log('Backend response:', data); // ✅ check what is returned
        setStaff(data.user);

      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, [id]);

  if (loading) return <div>Loading staff details...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;
  if (!staff) return <div>Staff not found</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{staff?.name || "N/A"}</h1>
      <p><strong>Email:</strong> {staff?.email || "N/A"}</p>
      <p><strong>Department:</strong> {staff?.department?.name || "N/A"}</p>
      <p><strong>Role:</strong> {staff?.role || "N/A"}</p>
      <Link to="/admin-dashboard" className="text-blue-500 mt-4 inline-block">Back to List</Link>
    </div>
  );
};

export default StaffDetails;
