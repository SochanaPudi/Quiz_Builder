import AdminLayout from '../../components/AdminLayout';
import { QBStorage } from '../../services/storage';

export default function Profile() {
  const user = QBStorage.session();

  return (
    <AdminLayout active="profile">
      <div className="page-head">
        <div>
          <h1>Profile</h1>
          <p>Your Quiz Builder account information.</p>
        </div>
      </div>

      <section className="card pad profile-card">
        <div className="field">
          <label htmlFor="name">Name</label>
          <input id="name" readOnly value={user.name} />
        </div>

        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" readOnly value={user.email} />
        </div>

        <div className="field">
          <label htmlFor="role">Role</label>
          <input id="role" value="Creator / Admin" readOnly />
        </div>
      </section>
    </AdminLayout>
  );
}
