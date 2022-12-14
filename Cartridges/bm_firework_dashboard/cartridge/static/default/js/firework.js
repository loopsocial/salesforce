function resetDashboard(redirectUrl)
{
    if (confirm("Are you sure you want to reset Firework Settings ?"))
    {
        window.location.href=redirectUrl;
    }
}