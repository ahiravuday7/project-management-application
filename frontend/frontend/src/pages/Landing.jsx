import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

const Landing = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <>
      {/* Hero Section */}
      <div className="text-dark py-5" style={{ backgroundColor: "#f1f3f5" }}>
        <div className="container text-center py-5">
          <h1 className="display-4 fw-bold text-danger">
            Manage Projects <span className="text-primary">Smarter</span>
          </h1>

          <p className="lead text-secondary mt-3">
            Plan, organize, and track your work in one place. TaskFlow helps
            teams collaborate seamlessly, stay focused, and deliver projects on
            time.
          </p>

          <div className="mt-4">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/register"
                  className="btn btn-primary btn-lg me-3 px-4"
                >
                  Get Started Free
                </Link>

                <Link
                  to="/login"
                  className="btn btn-outline-primary btn-lg px-4"
                >
                  Login
                </Link>
              </>
            ) : (
              <Link to="/dashboard" className="btn btn-primary btn-lg px-5">
                Go to Dashboard
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container py-5">
        <h2 className="text-center fw-bold mb-5">
          Everything you need to manage work
        </h2>

        <div className="row g-4">
          <div className="col-md-4">
            <div className="card h-100 shadow-sm border-0 text-center p-4">
              <h5 className="fw-bold">Boards & Tasks</h5>
              <p className="text-muted mt-2">
                Create boards for each project and break work into clear tasks
                with simple, flexible workflows.
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card h-100 shadow-sm border-0 text-center p-4">
              <h5 className="fw-bold">Team Collaboration</h5>
              <p className="text-muted mt-2">
                Assign tasks to team members, share updates, and stay aligned
                without long message threads.
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card h-100 shadow-sm border-0 text-center p-4">
              <h5 className="fw-bold">Track Progress</h5>
              <p className="text-muted mt-2">
                Move tasks across columns to instantly see what’s pending, in
                progress, and completed.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-light py-5">
        <div className="container text-center">
          <h2 className="fw-bold">Start managing your projects today!</h2>
          <p className="text-muted mt-2">
            Set up your first board in minutes and keep your work moving with a
            simple, modern workflow.
          </p>

          {!isAuthenticated && (
            <Link to="/register" className="btn btn-primary btn-lg mt-3 px-5">
              Create Free Account
            </Link>
          )}
        </div>
      </div>
    </>
  );
};

export default Landing;
