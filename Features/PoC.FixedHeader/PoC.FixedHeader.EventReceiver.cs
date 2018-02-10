using System;
using System.Runtime.InteropServices;
using System.Security.Permissions;
using Microsoft.SharePoint;

namespace Procad.Features.Procad
{
    /// <summary>
    /// This class handles events raised during feature activation, deactivation, installation, uninstallation, and upgrade.
    /// </summary>
    /// <remarks>
    /// The GUID attached to this class may be used during packaging and should not be modified.
    /// </remarks>

    [Guid("2ebc548c-a07c-49a5-8821-95ebc4c2402b")]
    public class ProcadEventReceiver : SPFeatureReceiver
    {
        // Uncomment the method below to handle the event raised after a feature has been activated.

        public override void FeatureActivated(SPFeatureReceiverProperties properties)
        {

            // Create Hidden List
            SPSite currentSite = properties.Feature.Parent as SPSite;
            if (!GetList(currentSite.RootWeb, "FixedHeader"))
            { 
            Guid listid = currentSite.RootWeb.Lists.Add("FixedHeader", "ConfigurationList for FixedHeader", SPListTemplateType.GenericList);
            SPList list = currentSite.RootWeb.Lists[listid];
            list.Hidden = true;
            list.Update();
            }
        }

        private bool GetList(SPWeb root, string listName)
        {
            bool bret = false;
            try
            {
                if (root.Lists[listName] != null) bret = true;

            }
            catch { }
            return bret;
        }
        // Uncomment the method below to handle the event raised before a feature is deactivated.

        public override void FeatureDeactivating(SPFeatureReceiverProperties properties)
        {
            SPSite currentSite = properties.Feature.Parent as SPSite;
            if (GetList(currentSite.RootWeb, "FixedHeader"))
            {
                var list = currentSite.RootWeb.Lists["FixedHeader"];
                list.Delete();
            }

        }


        // Uncomment the method below to handle the event raised after a feature has been installed.

        //public override void FeatureInstalled(SPFeatureReceiverProperties properties)
        //{
        //}


        // Uncomment the method below to handle the event raised before a feature is uninstalled.

        //public override void FeatureUninstalling(SPFeatureReceiverProperties properties)
        //{
        //}

        // Uncomment the method below to handle the event raised when a feature is upgrading.

        //public override void FeatureUpgrading(SPFeatureReceiverProperties properties, string upgradeActionName, System.Collections.Generic.IDictionary<string, string> parameters)
        //{
        //}
    }
}
