import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Stack,
  Avatar,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  TextField,
  Autocomplete,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  getTasks,
  getTaskLogs,
  getUsers,
  updateTask,
  deleteTask,
} from "../api/tasks";
import type { Task, TaskLog, User } from "../types";

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

const statusColor: Record<
  string,
  "default" | "warning" | "info" | "error" | "success"
> = {
  pending: "warning",
  in_progress: "info",
  halted: "error",
  completed: "success",
};

const statusLabel: Record<string, string> = {
  pending: "Pending",
  in_progress: "In progress",
  halted: "Halted",
  completed: "Completed",
};

function ViewTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [logs, setLogs] = useState<TaskLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  const [editTask, setEditTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editUsers, setEditUsers] = useState<User[]>([]);
  const [editError, setEditError] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadTasks = () => {
    getTasks().then((data) => {
      setTasks(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadTasks();
    getUsers().then(setEmployees);
  }, []);

  const openDetails = async (task: Task) => {
    setSelectedTask(task);
    setLogsLoading(true);
    const data = await getTaskLogs(task.id);
    setLogs(data);
    setLogsLoading(false);
  };

  const closeDetails = () => {
    setSelectedTask(null);
    setLogs([]);
  };

  const openEdit = (task: Task) => {
    setEditTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description || "");
    setEditUsers(task.users);
    setEditError("");
  };

  const closeEdit = () => setEditTask(null);

  const submitEdit = async () => {
    if (!editTask) return;
    setEditError("");

    if (!editTitle.trim()) {
      setEditError("Task title is required.");
      return;
    }
    if (editUsers.length === 0) {
      setEditError("Assign at least one employee.");
      return;
    }

    setEditSubmitting(true);
    try {
      await updateTask(editTask.id, {
        title: editTitle,
        description: editDescription,
        user_ids: editUsers.map((u) => u.id),
      });
      closeEdit();
      loadTasks();
    } catch {
      setEditError("Failed to update task. Please try again.");
    } finally {
      setEditSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteTask(deleteTarget.id);
      setDeleteTarget(null);
      loadTasks();
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <Typography>Loading tasks...</Typography>;

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700 }} gutterBottom>
        View tasks
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Monitor progress and review employee updates for every task
      </Typography>

      <Grid container spacing={3}>
        {tasks.map((task) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={task.id}>
            <Card
              variant="outlined"
              sx={{
                borderRadius: 1,
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Stack
                  direction="row"
                  sx={{
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1.5,
                  }}
                >
                  <Chip
                    label={statusLabel[task.status]}
                    color={statusColor[task.status]}
                    size="small"
                    sx={{ fontWeight: 600, flexShrink: 0 }}
                  />
                  <Stack direction="row" spacing={0.5}>
                    <IconButton size="small" onClick={() => openEdit(task)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => setDeleteTarget(task)}
                    >
                      <DeleteIcon fontSize="small" color="error" />
                    </IconButton>
                  </Stack>
                </Stack>

                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 700 }}
                  gutterBottom
                >
                  {task.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mb: 2,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {task.description || "No description provided."}
                </Typography>

                <LinearProgress
                  variant="determinate"
                  value={task.progress}
                  sx={{ mb: 0.5, borderRadius: 1, height: 6 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {task.progress}% complete
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: 600 }}
                >
                  ASSIGNED TO
                </Typography>
                <Stack direction="row" spacing={-0.5} sx={{ mt: 1 }}>
                  {task.users.length === 0 && (
                    <Typography variant="body2" color="text.disabled">
                      Unassigned
                    </Typography>
                  )}
                  {task.users.map((u) => (
                    <Avatar
                      key={u.id}
                      title={u.name}
                      sx={{
                        width: 30,
                        height: 30,
                        fontSize: 12,
                        bgcolor: stringToColor(u.name),
                        border: "2px solid white",
                      }}
                    >
                      {initials(u.name)}
                    </Avatar>
                  ))}
                </Stack>
              </CardContent>

              <CardActions sx={{ px: 2, pb: 2 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => openDetails(task)}
                  sx={{ textTransform: "none", borderRadius: 2 }}
                >
                  View details
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={!!selectedTask}
        onClose={closeDetails}
        maxWidth="sm"
        fullWidth
      >
        {selectedTask && (
          <>
            <DialogTitle
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Chip
                  label={statusLabel[selectedTask.status]}
                  color={statusColor[selectedTask.status]}
                  size="small"
                  sx={{ mb: 1, fontWeight: 600 }}
                />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {selectedTask.title}
                </Typography>
              </Box>
              <IconButton onClick={closeDetails} size="small">
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent dividers>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {selectedTask.description || "No description provided."}
              </Typography>

              <LinearProgress
                variant="determinate"
                value={selectedTask.progress}
                sx={{ mb: 0.5, borderRadius: 1, height: 6 }}
              />
              <Typography variant="caption" color="text.secondary">
                {selectedTask.progress}% complete
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mt: 3, fontWeight: 600 }}
              >
                ASSIGNED TO
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                sx={{ mt: 1, mb: 3, flexWrap: "wrap" }}
              >
                {selectedTask.users.map((u) => (
                  <Chip
                    key={u.id}
                    avatar={
                      <Avatar
                        sx={{ bgcolor: stringToColor(u.name) + " !important" }}
                      >
                        {initials(u.name)}
                      </Avatar>
                    }
                    label={u.name}
                    size="small"
                  />
                ))}
              </Stack>

              <Divider sx={{ mb: 2 }} />

              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700 }}
                gutterBottom
              >
                Activity log
              </Typography>

              {logsLoading && (
                <Typography variant="body2" color="text.secondary">
                  Loading updates...
                </Typography>
              )}

              {!logsLoading && logs.length === 0 && (
                <Typography variant="body2" color="text.disabled">
                  No updates logged yet.
                </Typography>
              )}

              <Stack spacing={2} sx={{ mt: 1 }}>
                {logs.map((log) => (
                  <Box key={log.id} sx={{ display: "flex", gap: 1.5 }}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        fontSize: 12,
                        bgcolor: stringToColor(log.user.name),
                      }}
                    >
                      {initials(log.user.name)}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ alignItems: "center" }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {log.user.name}
                        </Typography>
                        <Chip
                          label={statusLabel[log.status_snapshot]}
                          size="small"
                          color={statusColor[log.status_snapshot]}
                          sx={{ height: 20, fontSize: 11 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {log.progress_snapshot}%
                        </Typography>
                      </Stack>
                      {log.note && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 0.5 }}
                        >
                          {log.note}
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.disabled">
                        {new Date(log.created_at).toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </DialogContent>

            <DialogActions>
              <Button onClick={closeDetails} sx={{ textTransform: "none" }}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Dialog open={!!editTask} onClose={closeEdit} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          Edit task
          <IconButton onClick={closeEdit} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {editError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {editError}
            </Alert>
          )}

          <TextField
            label="Task title"
            fullWidth
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Autocomplete
            multiple
            options={employees}
            getOptionLabel={(option: User) => option.name}
            value={editUsers}
            onChange={(_, newValue: User[]) => setEditUsers(newValue)}
            renderInput={(params) => (
              <TextField {...params} label="Assigned employees" />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEdit} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={submitEdit}
            disabled={editSubmitting}
            sx={{ textTransform: "none" }}
          >
            {editSubmitting ? "Saving..." : "Save changes"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete task?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            This will permanently delete "{deleteTarget?.title}" and all of its
            logged updates. This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteTarget(null)}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={confirmDelete}
            disabled={deleting}
            sx={{ textTransform: "none" }}
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ViewTasksPage;
