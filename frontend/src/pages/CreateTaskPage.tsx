import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Autocomplete,
  Alert,
  Avatar,
  Stack,
  Divider,
} from "@mui/material";
import AddTaskIcon from "@mui/icons-material/AddTask";
import SendIcon from "@mui/icons-material/Send";
import { getUsers, createTask } from "../api/tasks";
import type { User } from "../types";

function stringToColor(name: string) {
  const colors = [
    "#1976d2",
    "#2e7d32",
    "#d32f2f",
    "#f9a825",
    "#7b1fa2",
    "#0288d1",
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function CreateTaskPage() {
  const [employees, setEmployees] = useState<User[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getUsers().then(setEmployees);
  }, []);

  const handleSubmit = async () => {
    setError("");
    setSuccess(false);

    if (!title.trim()) {
      setError("Task title is required.");
      return;
    }
    if (selectedUsers.length === 0) {
      setError("Assign at least one employee.");
      return;
    }

    setSubmitting(true);
    try {
      await createTask({
        title,
        description,
        created_by: 1,
        user_ids: selectedUsers.map((u) => u.id),
      });
      setSuccess(true);
      setTitle("");
      setDescription("");
      setSelectedUsers([]);
    } catch {
      setError("Failed to create task. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Stack
        direction="row"
        spacing={1.5}
        sx={{ mb: 0.5, alignItems: "center" }}
      >
        <Box
          sx={{ bgcolor: "#1976d2", borderRadius: 1.5, p: 1, display: "flex" }}
        >
          <AddTaskIcon sx={{ color: "white", fontSize: 22 }} />
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Create task
        </Typography>
      </Stack>
      <Typography color="text.secondary" sx={{ mb: 4, ml: 6.5 }}>
        Assign new work to one or more employees
      </Typography>

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={3}
        sx={{ alignItems: "flex-start" }}
      >
        {/* Form column */}
        <Paper
          variant="outlined"
          sx={{ p: 4, borderRadius: 3, flex: 2, width: "100%" }}
        >
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Task created successfully.
            </Alert>
          )}

          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ fontWeight: 600, letterSpacing: 1 }}
          >
            Task details
          </Typography>

          <TextField
            label="Task title"
            placeholder="e.g. Fix checkout page bug"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{ mt: 2, mb: 3 }}
          />

          <TextField
            label="Description"
            placeholder="Describe what needs to be done..."
            fullWidth
            multiline
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={{ mb: 4 }}
          />

          <Divider sx={{ mb: 3 }} />

          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ fontWeight: 600, letterSpacing: 1 }}
          >
            Assignment
          </Typography>

          <Autocomplete
            multiple
            options={employees}
            getOptionLabel={(option) => option.name}
            value={selectedUsers}
            onChange={(_, newValue) => setSelectedUsers(newValue)}
            sx={{ mt: 2, mb: 4 }}
            renderOption={(props, option) => (
              <Box component="li" {...props} key={option.id}>
                <Avatar
                  sx={{
                    width: 28,
                    height: 28,
                    fontSize: 13,
                    bgcolor: stringToColor(option.name),
                    mr: 1.5,
                  }}
                >
                  {initials(option.name)}
                </Avatar>
                {option.name}
              </Box>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Assign to employees"
                placeholder={
                  selectedUsers.length ? "" : "Select one or more employees"
                }
              />
            )}
          />

          <Button
            variant="contained"
            size="large"
            endIcon={<SendIcon />}
            onClick={handleSubmit}
            disabled={submitting}
            sx={{
              borderRadius: 2,
              px: 3,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            {submitting ? "Creating..." : "Create task"}
          </Button>
        </Paper>

        {/* Live summary column */}
        <Paper
          variant="outlined"
          sx={{
            p: 3,
            borderRadius: 3,
            flex: 1,
            width: "100%",
            bgcolor: "#fafbfc",
          }}
        >
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ fontWeight: 600, letterSpacing: 1 }}
          >
            Preview
          </Typography>
          <Typography variant="h6" sx={{ mt: 1.5, fontWeight: 600 }}>
            {title.trim() || "Untitled task"}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5, mb: 2 }}
          >
            {description.trim() || "No description yet."}
          </Typography>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontWeight: 600 }}
          >
            ASSIGNED TO
          </Typography>
          <Stack direction="row" spacing={-0.5} sx={{ mt: 1 }}>
            {selectedUsers.length === 0 && (
              <Typography variant="body2" color="text.disabled">
                No one assigned yet
              </Typography>
            )}
            {selectedUsers.map((u) => (
              <Avatar
                key={u.id}
                sx={{
                  width: 32,
                  height: 32,
                  fontSize: 13,
                  bgcolor: stringToColor(u.name),
                  border: "2px solid white",
                }}
                title={u.name}
              >
                {initials(u.name)}
              </Avatar>
            ))}
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}

export default CreateTaskPage;
