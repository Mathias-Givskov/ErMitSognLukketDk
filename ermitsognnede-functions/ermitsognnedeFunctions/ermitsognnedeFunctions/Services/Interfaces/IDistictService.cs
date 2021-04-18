using ermitsognnedeFunctions.Models;
using System.Collections.Generic;
using System.IO;

namespace ermitsognnedeFunctions.Services.Interfaces
{
    public interface IDistictService
    {
        List<DistrictDataJsonModel> GetDistrictDataJsonModels(Stream excelFileStream);
    }
}
