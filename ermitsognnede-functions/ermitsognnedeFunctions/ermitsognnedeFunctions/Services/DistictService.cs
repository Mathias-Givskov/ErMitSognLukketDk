using ermitsognnedeFunctions.Models;
using ermitsognnedeFunctions.Services.Interfaces;
using NPOI.SS.UserModel;
using System.Collections.Generic;
using System.IO;

namespace ermitsognnedeFunctions.Services
{
    public class DistictService : IDistictService
    {
        public List<DistrictDataJsonModel> GetDistrictDataJsonModels(Stream excelFileStream)
        {
            var workbook = WorkbookFactory.Create(excelFileStream);
            var firstSheet = workbook.GetSheetAt(0);

            var result = new List<DistrictDataJsonModel>();
            for (int rowIndex = 4; rowIndex < firstSheet.LastRowNum; rowIndex++)
            {
                var row = firstSheet.GetRow(rowIndex);

                if (row == null)
                    continue;

                result.Add(new DistrictDataJsonModel
                {
                    District = row.GetCell(1)?.StringCellValue,
                    Municipality = row.GetCell(2)?.StringCellValue,
                    DistrictPopulationCount = (int)row.GetCell(3)?.NumericCellValue,
                    Incidence = (int)row.GetCell(4)?.NumericCellValue,
                    NewInfectedCount = (int)row.GetCell(5)?.NumericCellValue,
                    PositivePercentage = (double)(row.GetCell(6)?.NumericCellValue),
                    IsClosed = row.GetCell(7)?.StringCellValue?.ToLower() == "nedlukket",
                    StartOfLatestAutomaticShutdown = row.GetCell(8)?.CellType == CellType.String ? null : row.GetCell(8)?.DateCellValue
                });
            }

            return result;
        }
    }
}
