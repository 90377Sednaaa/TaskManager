import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Stack,
  Chip,
  LinearProgress,
  Divider,
} from "@mui/material";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { getMyTasks } from "../api/tasks";
import type { Task, User } from "../types";

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

const statusHex: Record<string, string> = {
  pending: "#f9a825",
  in_progress: "#0288d1",
  halted: "#d32f2f",
  completed: "#2e7d32",
};

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <Paper
      elevation={1}
      sx={{
        p: { xs: 2, sm: 3 },
        borderRadius: 3,
        minHeight: 112,
        bgcolor: "background.paper",
        position: "relative",
        overflow: "hidden",
        "&::after": {
          content: '""',
          position: "absolute",
          top: 0,
          right: 0,
          width: 80,
          height: 80,
          bgcolor: color,
          opacity: 0.08,
          borderBottomLeftRadius: 120,
        },
      }}
    >
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {label}
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: 700 }}>
        {value}
      </Typography>
    </Paper>
  );
}

interface EmployeeDashboardProps {
  currentUser: User | undefined;
}

function EmployeeDashboard({ currentUser }: EmployeeDashboardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);
    getMyTasks(currentUser.id).then((data) => {
      setTasks(data);
      setLoading(false);
    });
  }, [currentUser]);

  if (!currentUser)
    return (
      <Typography color="text.disabled">Select an employee first.</Typography>
    );
  if (loading) return <Typography>Loading...</Typography>;

  const total = tasks.length;
  const pending = tasks.filter((t) => t.status === "pending").length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const halted = tasks.filter((t) => t.status === "halted").length;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const completionRate =
    total === 0 ? 0 : Math.round((completed / total) * 100);
  const avgProgress =
    total === 0
      ? 0
      : Math.round(tasks.reduce((sum, t) => sum + t.progress, 0) / total);

  const outstandingTasks = tasks
    .filter((t) => t.status !== "completed")
    .sort(
      (a, b) =>
        new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime(),
    );

  const pieData = [
    { name: "Pending", value: pending, key: "pending" },
    { name: "In progress", value: inProgress, key: "in_progress" },
    { name: "Halted", value: halted, key: "halted" },
    { name: "Completed", value: completed, key: "completed" },
  ].filter((d) => d.value > 0);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <Box sx={{ display: "grid", gap: 3 }}>
      <Paper
        elevation={1}
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 3,
          bgcolor: "background.paper",
          boxShadow: "0 20px 45px rgba(15, 23, 42, 0.06)",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={3}
          sx={{ alignItems: "flex-start", justifyContent: "space-between" }}
        >
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
              {greeting}, {currentUser.name.split(" ")[0]}
            </Typography>
            <Typography
              color="text.secondary"
              sx={{ maxWidth: 560, lineHeight: 1.75 }}
            >
              {total === 0
                ? "You don't have any tasks assigned yet."
                : `You have ${pending + inProgress} task${pending + inProgress === 1 ? "" : "s"} that need attention.`}
            </Typography>
          </Box>
          <Box sx={{ minWidth: 220, display: "grid", gap: 1 }}>
            <Chip
              label="Productivity dashboard"
              color="info"
              size="small"
              sx={{
                alignSelf: "start",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            />
            <Chip
              label={`Completion ${completionRate}%`}
              color={completionRate === 100 ? "success" : "primary"}
              sx={{ alignSelf: "start", fontWeight: 700 }}
            />
          </Box>
        </Stack>
      </Paper>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <StatCard label="Total tasks" value={total} color="#1976d2" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <StatCard label="Pending" value={pending} color="#f9a825" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <StatCard label="In progress" value={inProgress} color="#0288d1" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <StatCard label="Halted" value={halted} color="#d32f2f" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <StatCard label="Completed" value={completed} color="#2e7d32" />
        </Grid>
      </Grid>

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 700 }}>
          Open tasks ({outstandingTasks.length})
        </Typography>
        {outstandingTasks.length === 0 ? (
          <Typography variant="body2" color="text.disabled" sx={{ py: 2 }}>
            No Tasks open — nice work!
          </Typography>
        ) : (
          <Stack divider={<Divider />} spacing={1.5}>
            {outstandingTasks.slice(0, 6).map((task) => (
              <Stack
                key={task.id}
                direction="row"
                spacing={2}
                sx={{
                  py: 0.75,
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box sx={{ minWidth: 0, flex: 1, overflow: "hidden" }}>
                  <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
                    {task.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Updated {new Date(task.updated_at).toLocaleDateString()}
                  </Typography>
                </Box>
                <Box sx={{ minWidth: 100, width: 120 }}>
                  <LinearProgress
                    variant="determinate"
                    value={task.progress}
                    sx={{ height: 6, borderRadius: 1, mb: 0.5 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {task.progress}%
                  </Typography>
                </Box>
                <Chip
                  label={statusLabel[task.status]}
                  color={statusColor[task.status]}
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              </Stack>
            ))}
          </Stack>
        )}
      </Paper>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper
            variant="outlined"
            sx={{ p: 3, borderRadius: 3, height: "100%" }}
          >
            <Typography
              variant="subtitle1"
              gutterBottom
              sx={{ fontWeight: 700 }}
            >
              My status breakdown
            </Typography>
            {total === 0 ? (
              <Typography
                variant="body2"
                color="text.disabled"
                sx={{ py: 4, textAlign: "center" }}
              >
                No data yet
              </Typography>
            ) : (
              <>
                <Box sx={{ width: "100%", height: 200 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                      >
                        {pieData.map((entry) => (
                          <Cell key={entry.key} fill={statusHex[entry.key]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
                <Stack
                  spacing={1}
                  sx={{
                    mt: 1,
                    flexWrap: "wrap",
                    justifyContent: "center",
                    display: "flex",
                  }}
                >
                  {pieData.map((entry) => (
                    <Chip
                      key={entry.key}
                      size="small"
                      label={`${entry.name} (${entry.value})`}
                      sx={{
                        bgcolor: statusHex[entry.key],
                        color: "white",
                        fontWeight: 600,
                        mr: 1,
                        mb: 1,
                      }}
                    />
                  ))}
                </Stack>
              </>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Typography
              variant="subtitle1"
              gutterBottom
              sx={{ fontWeight: 700 }}
            >
              Overall completion
            </Typography>
            <Stack
              direction="row"
              spacing={2}
              sx={{ mb: 3, alignItems: "center" }}
            >
              <Box sx={{ flex: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={completionRate}
                  sx={{ height: 10, borderRadius: 1 }}
                  color={completionRate === 100 ? "success" : "primary"}
                />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {completionRate}%
              </Typography>
            </Stack>
            <Typography variant="caption" color="text.secondary">
              {completed} of {total} tasks completed
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography
              variant="subtitle1"
              gutterBottom
              sx={{ fontWeight: 700 }}
            >
              Average progress across active tasks
            </Typography>
            <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
              <Box sx={{ flex: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={avgProgress}
                  sx={{ height: 10, borderRadius: 1 }}
                />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {avgProgress}%
              </Typography>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default EmployeeDashboard;
